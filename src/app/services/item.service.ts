import { Injectable } from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpHeaders} from '@angular/common/http';
import {CONFIG} from '../config';
import {Observable} from 'rxjs/Observable';
import {catchError, retry} from 'rxjs/operators';
import {AlertService} from './alert.service';


@Injectable()
export class ItemService {

  constructor(private http: HttpClient, private  alertService: AlertService) { }

  private jwt() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser.token) {
      const headers = new HttpHeaders(({ 'x-access-token': currentUser.token }));
      return {headers: headers};
    }
  }

  /**
   * Gets an array of items from the backend
   */
 private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      // client side or network error
      this.alertService.queueAlert(`An error occurred: ${error.error.message}`);
    } else {
      // backed encountered an error
      this.alertService.queueAlert(
        `Backend returned error code ${error.status}. ` +
        `Message was: ${error.message}`
      );
    }
    return Observable.throw(error);
  }

  getItems(): Observable<any> {
    return this.http.get(`${CONFIG.api_url}/items`, this.jwt()).pipe(
      retry(2),
      catchError((err) => {
        return this.handleError(err);
      })
    );
  }

  /**
   * adds an item to database using POST
   * @param name:name of item
   * @param description: description of the item
   * @param price: price we charge
   * @param cost: price we pay for item
   * @param warn_level: warning stock level of the item (will email at this level)
   */

  addItem(name: String, description: String, price: Number, cost: Number, warn_level: Number): Observable<any> {
    return this.http.post(`${CONFIG.api_url}/items`, {
      name: name,
      description: description,
      price: price,
      shop_cost: cost,
      warning_quantity: warn_level
    }, this.jwt()).pipe(
      retry(2),
      catchError((err) => {
        return this.handleError(err);
      })
    );
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
  updateItem(id: String, price: Number, shop_cost: Number, quantity: Number, warn_level: Number): Observable<any> {
    return this.http.put(`${CONFIG.api_url}/items/${id}`, {
     price: price,
     shop_cost: shop_cost,
     quantity: quantity,
     warning_quantity: warn_level
    }, this.jwt()).pipe(
      retry(2),
      catchError((err) => {
        return this.handleError(err);
      })
    );
  }
}
