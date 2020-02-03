import { Injectable } from '@angular/core';
import {CONFIG} from '../config';
import {Http, Headers, RequestOptions} from '@angular/http';
import {AlertService} from './alert.service';
import {OrderItem} from '../models/orderItem';

@Injectable()
export class OrderService {
  private backendURL = `${CONFIG.api_url}/admin/orders`;

  constructor(private http: Http, private alertService: AlertService) {
  }
  // gets JWT for any request to backend
  private static jwt() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser.token) {
      const headers = new Headers({'x-access-token': currentUser.token});
      return new RequestOptions({headers: headers});
    }
  }

  // generic error handler
  private handleError(err): void {
    // for now just log the error to console
    console.log(err);
  }

  /**
   * Gets orders in a specified daterange
   * @param start: oldest date to get orders for
   * @param end: newest date to get orders for
   */
  getOrders(start, end): Promise<any> {
    const queryURL = this.backendURL + '/?start=' + start + '&end=' + end;
    return this.http.get(queryURL, OrderService.jwt())
      .toPromise()
      .then(res => res.json())
      .catch(err => this.handleError(err));
  }

  /**
   * Creates a new order on the backend
   * @param supplier: order supplier
   * @param items: list of items in order and the quantity ordered
   */
  createOrder(supplier: string, items: OrderItem[]): Promise<any> {
    return this.http.post(this.backendURL,
      {supplier: supplier, items: items},
      OrderService.jwt())
      .toPromise()
      .then(res => res.json())
      .catch(err => this.handleError(err));
  }

  updateOrder(id: string,
              supplier?: string,
              items?: OrderItem[],
              status?: string,
              tracking_num?: string): Promise<any> {
    const update = {};
    if (supplier) {
      update['supplier'] = supplier;
    }
    if (items) {
      update['items'] = items;
    }
    if (status) {
      update['status'] = status;
    }
    if (tracking_num) {
      update['tracking_number'] = tracking_num;
    }
    return this.http.put(`${this.backendURL}/${id}`, update, OrderService.jwt())
      .toPromise()
      .then(res => res.json())
      .catch(err => this.handleError(err));
  }
}
