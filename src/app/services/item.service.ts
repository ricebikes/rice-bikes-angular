import { Injectable } from '@angular/core';
import {Headers, Http, RequestOptions} from '@angular/http';
import {CONFIG} from '../config';
import {HttpErrorResponse} from '@angular/common/http';
import {AlertService} from './alert.service';
import {Item} from '../models/item';


@Injectable()
export class ItemService {

  constructor(private http: Http, private alertService: AlertService) { }

  private jwt() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser.token) {
      const headers = new Headers({ 'x-access-token': currentUser.token });
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
   * Gets an array of items from the backend
   */

  getItems(): Promise<any> {
    return this.http.get(`${CONFIG.api_url}/items`, this.jwt())
      .toPromise()
      .then(res => res.json())
      .catch(err => this.handleError(err));
  }

  /**
   * Creates a new Item using POST
   * @param newItem: new Item, in the form of the item class
   */
  createItem(newItem: Item): Promise<Item> {
    delete newItem._id; // to prevent errors on backend
    return this.http.post(`${CONFIG.api_url}/items`, newItem, this.jwt())
      .toPromise()
      .then(res => res.json())
      .catch(err => this.handleError(err));
  }

  /**
   * updates an item in the database, note that many fields cannot be updated since
   * the frontend does not expose them currently
   * @param id:  id of document to update
   * @param price: new price of item
   * @param shop_cost: cost to shop
   * @param quantity: quantity of item (note this can only be set here)
   * @param warn_level: level to warn operations of low stock
   */
  updateItem(id: String, price: Number, shop_cost: Number, quantity: Number, warn_level: Number): Promise<any> {
    return this.http.put(`${CONFIG.api_url}/items/${id}`, {
     price: price,
     shop_cost: shop_cost,
     quantity: quantity,
     warning_quantity: warn_level
    }, this.jwt())
      .toPromise()
      .then(res => res.json())
      .catch( err => this.handleError(err));
  }
}
