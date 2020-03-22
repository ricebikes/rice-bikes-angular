import { Injectable } from '@angular/core';
import {CONFIG} from '../config';
import {Http, Headers, RequestOptions} from '@angular/http';
import {AlertService} from './alert.service'; ]
import {OrderRequest} from '../models/orderRequest';
import {Order} from '../models/order';
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
  getLatestRequests(n: number) {
    this.authService.getCredentials().then(cred => {
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
  createOrderReq(quantity: number, request: string, transaction?: Transaction, item?: Item) {
    const body = {
      quantity: quantity,
      request: request
    };
    if (transaction) {body['transaction'] = transaction; }
    if (item) {body['item'] = item; }
    this.authService.getUserCredentials().then(cred => {
      return this.http.post(this.backendURL, body, cred)
        .toPromise()
        .then(res => res.json() as OrderRequest)
        .catch(err => this.handleError(err));
    });
  }

  setRequestString(orderReq)
}
