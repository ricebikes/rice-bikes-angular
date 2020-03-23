import { Injectable } from '@angular/core';
import {CONFIG} from '../config';
import {Http, Headers, RequestOptions} from '@angular/http';
import {AlertService} from './alert.service';
import {OrderRequest} from '../models/orderRequest';
import {AuthenticationService} from './authentication.service';
import {HttpErrorResponse} from '@angular/common/http';
import {Item} from '../models/item';
import {Transaction} from '../models/transaction';

@Injectable()
export class OrderRequestService {
  private backendURL = `${CONFIG.api_url}/orders`;

  constructor(private http: Http,
              private alertService: AlertService,
              private  authService: AuthenticationService) { }

  private handleError(err: HttpErrorResponse): void {
    let message = err.message;
    if (!message) {
      message = JSON.stringify(err);
    }
    this.alertService.error(err.statusText, message, err.status);
  }

  /**
   * Gets the latest 'n' OrderRequests
   * @param n: number of requests to get (upper limit)
   */
  getLatestRequests(n: number): Promise<OrderRequest[]> {
    return this.authService.getCredentials().then(cred => {
      return this.http.get(`${this.backendURL}/latest/${n}`, cred)
        .toPromise()
        .then(res => res.json() as OrderRequest[])
        .catch(err => this.handleError(err));
    });
  }

  /**
   * Create an order request
   * @param quantity: quantity of item requested
   * @param request: string describing the item requested
   * @param transaction: transaction, if any, that the item is requested for
   * @param item: item that will be ordered
   */
  createOrderReq(quantity: number, request: string, transaction?: Transaction, item?: Item): Promise<OrderRequest> {
    const body = {
      quantity: quantity,
      request: request
    };
    if (transaction) {body['transaction'] = transaction; }
    if (item) {body['item'] = item; }
    return this.authService.getUserCredentials().then(cred => {
      return this.http.post(this.backendURL, body, cred)
        .toPromise()
        .then(res => res.json() as OrderRequest)
        .catch(err => this.handleError(err));
    });
  }

  /**
   * Sets the request string for an OrderRequest
   * @param orderReq: request to update
   * @param request: new string to set for Order Request
   */
  setRequestString(orderReq: OrderRequest, request: string): Promise<OrderRequest> {
    return this.authService.getUserCredentials().then(cred => {
      return this.http.put(`${this.backendURL}/${orderReq._id}/request`,
        {request: request},
        cred)
        .toPromise()
        .then(res => res.json() as OrderRequest)
        .catch(err => this.handleError(err));
    });
  }

  /**
   * Sets the quantity of an order request requested
   * @param orderReq: Order Request
   * @param quantity: quantity to set
   */
  setQuantity(orderReq: OrderRequest, quantity: number): Promise<OrderRequest> {
    return this.authService.getUserCredentials().then(cred => {
      return this.http.put(`${this.backendURL}/${orderReq._id}/quantity`,
        {quantity: quantity},
               cred)
        .toPromise()
        .then(res => res.json() as OrderRequest)
        .catch(err => this.handleError(err));
    });
  }

  /**
   * Update the status of an order request
   * @param orderReq: order request to update
   * @param status: status to set
   */
  setStatus(orderReq: OrderRequest, status: string): Promise<OrderRequest> {
    return this.authService.getUserCredentials().then(cred => {
      return this.http.put(`${this.backendURL}/${orderReq._id}/status`,
        {status: status},
        cred)
        .toPromise()
        .then(res => res.json() as OrderRequest)
        .catch(err => this.handleError(err));
    });
  }

  /**
   * Set the transaction for an order request
   * @param orderReq: order request to update
   * @param transaction: transaction to associate
   */
  setTransaction(orderReq: OrderRequest, transaction: Transaction): Promise<OrderRequest> {
    return this.authService.getUserCredentials().then(cred => {
      return this.http.put(`${this.backendURL}/${orderReq._id}/transaction`,
        {transaction_id: transaction._id},
        cred)
        .toPromise()
        .then(res => res.json() as OrderRequest)
        .catch(err => this.handleError(err));
    });
  }

  /**
   * Set the item for an order request
   * @param orderReq: order request to update
   * @param item: item to associate with it
   */
  setItem(orderReq: OrderRequest, item: Item): Promise<OrderRequest> {
    return this.authService.getUserCredentials().then(cred => {
      return this.http.put(`${this.backendURL}/${orderReq._id}/item`,
        {item_id: item._id},
        cred)
        .toPromise()
        .then(res => res.json() as OrderRequest)
        .catch(err => this.handleError(err));
    });
  }

  /**
   * Deletes an Order Request from the database
   * @param orderReq: Order Request to delete
   */
  deleteRequest(orderReq: OrderRequest): Promise<void> {
    return this.authService.getCredentials().then(cred => {
      return this.http.delete(`${this.backendURL}/${orderReq._id}`, cred)
        .toPromise()
        .catch(err => this.handleError(err));
    });
  }
}
