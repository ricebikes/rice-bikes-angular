import { Injectable } from '@angular/core';
import { Transaction } from '../models/transaction';
import {BehaviorSubject, Observable} from 'rxjs';
import 'rxjs/add/operator/toPromise';
import {Headers, Http, RequestOptions} from '@angular/http';
import { Customer } from '../models/customer';
import { Bike } from '../models/bike';
import {Router} from '@angular/router';
import {AlertService} from './alert.service';
import {CONFIG} from '../config';
import {AuthenticationService} from './authentication.service';

@Injectable()
export class TransactionService {

  private backendUrl = `${CONFIG.api_url}/transactions`;

  public transaction: BehaviorSubject<Transaction>;

  constructor(private http: Http, private router: Router, private alertService: AlertService, private authService: AuthenticationService) {
    this.transaction = new BehaviorSubject<Transaction>(null);
  }


  private handleError(err): void {
    console.log("ERROR");
    console.log(err);
    if (err.status === 401 ) {
      this.alertService.error('Looks like you aren\'t allowed to do that :(', false);
    }
  }

  /**
   * Requests transactions. Accepts an optional props object, which will append a query string with these values.
   * @param props
   * @returns {Promise<any>}
   */
  getTransactions(props?: any): Promise<any> {
    const querystring = '?' + Object.keys(props).map(k => `${k}=${encodeURIComponent(props[k])}`).join('&');
    return this.http.get(this.backendUrl + querystring, this.authService.getCredentials())
      .toPromise()
      .then(res => res.json() as Transaction[])
      .catch(err => this.handleError(err));
  }

  getTransaction(id: string): Promise<any> {
    return this.http.get(`${this.backendUrl}/${id}`, this.authService.getCredentials())
      .toPromise()
      .then(res => this.transaction.next(res.json() as Transaction))
      .catch(err => this.handleError(err));
  }

  updateTransaction(transaction: Transaction): Promise<any> {
    return this.http.put(`${this.backendUrl}/${transaction._id}`, transaction, this.authService.getCredentials())
      .toPromise()
      .then(res => this.transaction.next(res.json() as Transaction))
      .catch(err => this.handleError(err));
  }

  updateDescription(id: string, description: string): Promise<any> {
    return this.http.put(`${this.backendUrl}/${id}/description`, {'description': description},
      this.authService.getCredentials())
      .toPromise()
      .then(res => this.transaction.next(res.json() as Transaction))
      .catch(err => this.handleError(err));
  }

  setComplete(id: string, complete: boolean): Promise<any> {
    return this.http.put(`${this.backendUrl}/${id}/complete`, {'complete': complete},
      this.authService.getCredentials())
      .toPromise()
      .then(res => this.transaction.next(res.json() as Transaction))
      .catch(err => this.handleError(err));
  }

  setPaid(id: string, paid: boolean): Promise<any> {
      return this.http.put(`${this.backendUrl}/${id}/mark_paid`, {'is_paid': paid},
        this.authService.getCredentials())
        .toPromise()
        .then(res => this.transaction.next(res.json() as Transaction))
        .catch(err => this.handleError(err));
  }

  updateRepair(transactionID: string, repairID: string, completed: boolean): Promise<any> {
    return this.http.put(`${this.backendUrl}/${transactionID}/update_repair`, {_id: repairID, completed: completed},
      this.authService.getCredentials())
      .toPromise()
      .then(res => this.transaction.next(res.json() as Transaction))
      .catch(err => this.handleError(err));
  }


  createTransaction(type: string, customer: Customer): Promise<any> {
    const data = {
      transaction_type: type,
      customer: {
        email: customer.email,
        first_name: customer.first_name,
        last_name: customer.last_name
      }
    };
    return this.http.post(this.backendUrl, data, this.authService.getCredentials())
      .toPromise()
      .then(res => res.json() as Transaction)
      .catch(err => this.handleError(err));
  }

  createTransactionCustomerExists(type: string, customer_id: string): Promise<any> {
    const data = {
      transaction_type: type,
      customer: {
        _id: customer_id
      }
    };
    return this.http.post(this.backendUrl, data, this.authService.getCredentials())
      .toPromise()
      .then(res => res.json() as Transaction)
      .catch(err => this.handleError(err));
  }

  deleteTransaction(transaction_id: string): Promise<any> {
    return this.http.delete(`${this.backendUrl}/${transaction_id}`, this.authService.getCredentials())
      .toPromise()
      .then(res => this.transaction.next(null))
      .catch(err => this.handleError(err));
  }

  addNewBikeToTransaction(transaction_id: string, bike: Bike): Promise<any> {
    const data = {
      make: bike.make,
      model: bike.model,
      description: bike.description
    };
    return this.http.post(`${this.backendUrl}/${transaction_id}/bikes`, data, this.authService.getCredentials())
      .toPromise()
      .then(res => this.transaction.next(res.json()))
      .catch(err => this.handleError(err));
  }

  addExistingBikeToTransaction(transaction_id: string, bike_id: string): Promise<any> {
    return this.http.post(`${this.backendUrl}/${transaction_id}/bikes`, {_id: bike_id}, this.authService.getCredentials())
      .toPromise()
      .then(res => this.transaction.next(res.json()))
      .catch(err => this.handleError(err));
  }

  deleteBikeFromTransaction(transaction_id: string, bike_id: string): Promise<any> {
    return this.http.delete(`${this.backendUrl}/${transaction_id}/bikes/${bike_id}`, this.authService.getCredentials())
      .toPromise()
      .then(res => this.transaction.next(res.json()))
      .catch(err => this.handleError(err));
  }

  addItemToTransaction(transaction_id: string, item_id: string): Promise<any> {
    return this.http.post(`${this.backendUrl}/${transaction_id}/items`, {_id: item_id},
      this.authService.getCredentials())
      .toPromise()
      .then(res => this.transaction.next(res.json()))
      .catch(err => this.handleError(err));
  }

  deleteItemFromTransaction(transaction_id: string, item_id: string): Promise<any> {
    return this.http.delete(`${this.backendUrl}/${transaction_id}/items/${item_id}`,
      this.authService.getCredentials())
      .toPromise()
      .then(res => this.transaction.next(res.json()))
      .catch(err => this.handleError(err));
  }

  addRepairToTransaction(transaction_id: string, repair_id: string): Promise<any> {
    return this.http.post(`${this.backendUrl}/${transaction_id}/repairs`, {_id: repair_id},
      this.authService.getCredentials())
      .toPromise()
      .then(res => this.transaction.next(res.json()))
      .catch(err => this.handleError(err));
  }

  deleteRepairFromTransaction(transaction_id: string, repair_id: string): Promise<any> {
    return this.http.delete(`${this.backendUrl}/${transaction_id}/repairs/${repair_id}`,
      this.authService.getCredentials())
      .toPromise()
      .then(res => this.transaction.next(res.json()))
      .catch(err => this.handleError(err));
  }

  notifyCustomerEmail(transaction_id: string): Promise<any> {
    return this.http.get(`${this.backendUrl}/${transaction_id}/email-notify`, this.authService.getCredentials())
      .toPromise()
      .then(res => res.json())
      .catch(err => this.handleError(err));
  }
}
