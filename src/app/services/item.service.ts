import { Injectable } from "@angular/core";
import { Headers, Http, RequestOptions } from "@angular/http";
import { CONFIG } from "../config";
import { HttpErrorResponse } from "@angular/common/http";
import { AlertService } from "./alert.service";
import { AuthenticationService } from "./authentication.service";

import { Item } from "../models/item";

@Injectable()
export class ItemService {
  constructor(
    private http: Http,
    private alertService: AlertService,
    private authService: AuthenticationService
  ) { }

  private jwt() {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (currentUser.token) {
      const headers = new Headers({ "x-access-token": currentUser.token });
      return new RequestOptions({ headers: headers });
    }
  }

  private handleError(err: HttpErrorResponse): void {
    let message = err.message;
    if (!message) {
      message = JSON.stringify(err);
    }
    this.alertService.error(err.statusText, message, err.status);
  }

  /**
   * Gets an item by the item ID. Used for when an item has been updated to retrieve the new details.
   */

  /**
   * Gets an array of items from the backend. Do not use this to search for items, because it will also get the hidden items
   * from the backend that should not be added to tranasactions
   */
  async getItems(): Promise<Item[]> {
    return this.http
      .get(`${CONFIG.api_url}/items`, this.jwt())
      .toPromise()
      .then((res) => res.json())
      .catch((err) => this.handleError(err));
  }

  /**
   * Creates a new Item using POST
   * @param newItem: new Item, in the form of the item class
   */
  async createItem(newItem: Item): Promise<Item> {
    delete newItem._id; // to prevent errors on backend
    return this.authService.getUserCredentials().then((cred) => {
      return this.http
        .post(`${CONFIG.api_url}/items`, newItem, cred)
        .toPromise()
        .then((res) => res.json())
        .catch((err) => this.handleError(err))
    });
  }

  /**
   * Updates an item by overwriting the existing item's value
   * @param id:  id of document to update
   * @param item: Item to overwrite this document with
   */
  async updateItem(id: String, item: Item): Promise<Item> {
    delete item._id; // to prevent errors on backend
    return this.authService.getUserCredentials().then((cred) => {
      return this.http
        .put(`${CONFIG.api_url}/items/${id}`, item, cred)
        .toPromise()
        .then((res) => res.json())
        .catch((err) => this.handleError(err))
    });
  }

  /**
   * Disable/enable an item by UPC code
   * @param toggle: 0 for disable, 1 for enable
   * @param id: item ID
   * @param item: item without the _id
   */
  async toggleItem(toggle: number, id: String, item: Item): Promise<Item> {
    if(toggle) item.disabled = false;
    else item.disabled = true;

    return this.authService.getUserCredentials().then((cred) => {
      return this.http
        .put(`${CONFIG.api_url}/items/${id}`, item, cred)
        .toPromise()
        .then((res) => res.json())
        .catch((err) => this.handleError(err))
    });
  }

  /**
   * Grab updated item attributes from supplier
   * Searches supplier by upc
   * @param item the item to refresh
   */
  async refreshItem(upc: String) {
    return this.http
      .get(`${CONFIG.api_url}/items/upc/khs/${upc}`, this.jwt())
      .toPromise()
      .then((res) => res.json())
      .catch((err) => this.handleError(err));
  }

  /**
   * Gets the next UPC item number created by Rice Bikes
   */
  async nextUPC(): Promise<string> {
    return this.http
      .get(`${CONFIG.api_url}/items/upc/newUPC`, this.jwt())
      .toPromise()
      .then((res) => res.json())
      .catch((err) => this.handleError(err));
  }
}
