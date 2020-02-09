import { Injectable } from '@angular/core';
import {CONFIG} from '../config';
import {Http, Headers, RequestOptions} from '@angular/http';
import {AlertService} from './alert.service';
import {OrderItem} from '../models/orderItem';
import {HttpErrorResponse} from '@angular/common/http';
import {Order} from '../models/order';
import {Item} from '../models/item';

@Injectable()
export class OrderService {
  private backendURL = `${CONFIG.api_url}/orders`;

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

  private handleError(err: HttpErrorResponse): void {
    let message = err.message;
    if (!message) {
      message = JSON.stringify(err);
    }
    this.alertService.error(err.statusText, message, err.status);
  }

  /**
   * Gets orders in a specified daterange
   * @param start: oldest date to get orders for
   * @param end: newest date to get orders for
   */
  getOrders(start, end): Promise<any> {
    const queryURL = this.backendURL + '/daterange?start=' + start + '&end=' + end;
    return this.http.get(queryURL, OrderService.jwt())
      .toPromise()
      .then(res => res.json())
      .catch(err => this.handleError(err));
  }

  /**
   * Gets a single order from the backend
   * @param id
   */
  getOrder(id: string): Promise<Order> {
    return this.http.get(`${this.backendURL}/${id}`,
      OrderService.jwt())
      .toPromise()
      .then(res => res.json() as Order)
      .catch(err => this.handleError(err));
  }

  /**
   * Creates a new order on the backend
   * @param supplier: order supplier
   * @param items: list of items in order and the quantity ordered
   */
  createOrder(supplier: string): Promise<any> {
    return this.http.post(this.backendURL,
      {supplier: supplier},
      OrderService.jwt())
      .toPromise()
      .then(res => res.json())
      .catch(err => this.handleError(err));
  }

  /**
   * Updates a supplied order with a new supplier string
   * @param order: Order to update
   * @param supplier: supplier value to set on order
   */
  updateSupplier(order: Order, supplier: string): Promise<Order> {
    return this.http.put(`${this.backendURL}/${order._id}/supplier`,
      {supplier: supplier},
      OrderService.jwt())
      .toPromise()
      .then(res => res.json() as Order)
      .catch(err => this.handleError(err));
  }

  /**
   * Adds an item to the order
   * @param order: Order to add item to
   * @param item: OrderItem to add
   */
  addItem(order: Order, item: OrderItem): Promise<Order> {
    return this.http.post(`${this.backendURL}/${order._id}/item`,
      {item: OrderItem},
      OrderService.jwt())
      .toPromise()
      .then(res => res.json() as Order)
      .catch(err => this.handleError(err));
  }

  /**
   * Updates the stock of an OrderItem in an order
   * @param order: Order to update
   * @param item: Item to update stock of (backing Item, not OrderItem)
   * @param stock: new stock to set
   */
  updateStock(order: Order, item: Item, stock: number): Promise<Order> {
    return this.http.put(`${this.backendURL}/${order._id}/item/${item._id}/stock`,
      {stock: stock},
      OrderService.jwt())
      .toPromise()
      .then(res => res.json() as Order)
      .catch(err => this.handleError(err));
  }

  /**
   * Updates the transaction associated with an order
   * @param order: Order holding relevant item
   * @param item: Item to update transaction of (not OrderItem)
   * @param transaction_id: ID of transaction to set
   */
  updateTransaction(order: Order, item: Item, transaction_id: string): Promise<Order> {
    return this.http.put(`${this.backendURL}/${order._id}/item/${item._id}/transaction`,
      {transaction_id: transaction_id},
      OrderService.jwt())
      .toPromise()
      .then(res => res.json() as Order)
      .catch(err => this.handleError(err));
  }

  /**
   * Updates the tracking number of an order
   * @param order: Order to set tracking number of
   * @param tracking_number: tracking number to set into order (as string)
   */
  updateTrackingNumber(order: Order, tracking_number: string): Promise<Order> {
    return this.http.put(`${this.backendURL}/${order._id}/tracking_number`,
      {tracking_number: tracking_number},
      OrderService.jwt())
      .toPromise()
      .then(res => res.json() as Order)
      .catch(err => this.handleError(err));
  }

  /**
   * Updates the status of an order
   * @param order: Order to update the status of
   * @param status: status to set the order to
   */
  updateStatus(order: Order, status: string): Promise<Order> {
    return this.http.put(`${this.backendURL}/${order._id}/status`,
      {status: status},
      OrderService.jwt())
      .toPromise()
      .then(res => res.json() as Order)
      .catch(err => this.handleError(err));
  }

  /**
   * Deletes an order
   * @param order: Order to delete
   */
  deleteOrder(order: Order): Promise<void> {
    return this.http.delete(`${this.backendURL}/${order._id}`,
      OrderService.jwt())
      .toPromise()
      .catch(err => this.handleError(err));
  }

  /**
   * Deletes an OrderItem from the order
   * @param order: Order to remove item from
   * @param item: item within the OrderItem to remove
   */
  deleteItem(order: Order, item: Item): Promise<Order> {
    return this.http.delete(`${this.backendURL}/${order._id}/item/${item._id}`,
      OrderService.jwt())
      .toPromise()
      .then(res => res.json() as Order)
      .catch(err => this.handleError(err));
  }

}
