import { Injectable } from '@angular/core';
import {Headers, Http, RequestOptions} from '@angular/http';
import {CONFIG} from '../config';


@Injectable()
export class ItemService {

  constructor(private http: Http ) { }

  private jwt() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser.token) {
      const headers = new Headers({ 'x-access-token': currentUser.token });
      return new RequestOptions({ headers: headers });
    }
  }

  /**
   * Gets an array of items from the backend
   */

  getItems(): Promise<any> {
    return this.http.get(`${CONFIG.api_url}/items`, this.jwt())
      .toPromise()
      .then(res => res.json())
      .catch(err => console.log(err));
  }

  /**
   * adds an item to database using POST
   * @param name:name of item
   * @param description: description of the item
   * @param price: price we charge
   * @param cost: price we pay for item
   * @param warn_level: warning stock level of the item (will email at this level)
   */

  addItem(name: String, description: String, price: Number, cost: Number, warn_level: Number): Promise<any> {
    return this.http.post(`${CONFIG.api_url}/items`, {
      name: name,
      description: description,
      price: price,
      shop_cost: cost,
      warning_quantity: warn_level
    }, this.jwt())
      .toPromise()
      .then(res => res.json())
      .catch(err => console.log(err));
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
      .catch( err => console.log(err));
  }
}
