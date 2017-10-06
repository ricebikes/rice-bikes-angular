import { Injectable } from '@angular/core';
import { Transaction } from "../models/transaction";
import {BehaviorSubject, Observable} from "rxjs";
import 'rxjs/add/operator/toPromise';
import {Headers, Http, RequestOptions} from "@angular/http";
import { Customer } from "../models/customer";
import { Bike } from "../models/bike";
import {Router} from "@angular/router";
import {AlertService} from "./alert.service";

@Injectable()
export class TransactionService {

  private backendUrl: string = 'http://localhost:3000/transactions';

  public transaction: BehaviorSubject<Transaction>;

  constructor(private http: Http, private router: Router, private alertService: AlertService) {
    this.transaction = new BehaviorSubject<Transaction>(null);
  }

  private jwt() {
    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser && currentUser.token) {
      let headers = new Headers({ 'x-access-token': currentUser.token });
      return new RequestOptions({ headers: headers });
    }
  }

  private handleError(err): void {
    if (err.status == 401 ) {
      this.alertService.error("Looks like you aren't allowed to do that :(", false);
    }
  }

  getTransactions(): Promise<any> {
    return this.http.get(this.backendUrl, this.jwt())
      .toPromise()
      .then(res => res.json() as Transaction[])
      .catch(err => this.handleError(err));
  }

  getActiveTransactions(): Promise<any> {
    return this.http.get(`${this.backendUrl}/active`, this.jwt())
      .toPromise()
      .then(res => res.json() as Transaction[])
      .catch(err => this.handleError(err));
  }

  getCompletedTransactions(): Promise<any>{
    return this.http.get(`${this.backendUrl}/complete`, this.jwt())
      .toPromise()
      .then(res => res.json() as Transaction[])
      .catch(err => this.handleError(err));
  }

  getTransaction(id: string): Promise<any> {
    return this.http.get(`${this.backendUrl}/${id}`, this.jwt())
      .toPromise()
      .then(res => this.transaction.next(res.json() as Transaction))
      .catch(err => this.handleError(err));
  }

  updateTransaction(transaction: Transaction): Promise<any> {
    return this.http.put(`${this.backendUrl}/${transaction._id}`, transaction, this.jwt())
      .toPromise()
      .then(res => this.transaction.next(res.json() as Transaction))
      .catch(err => this.handleError(err));
  }

  createTransaction(type: string, customer: Customer): Promise<any> {
    let data = {
      transaction_type: type,
      customer: {
        email: customer.email,
        first_name: customer.first_name,
        last_name: customer.last_name
      }
    };
    return this.http.post(this.backendUrl, data, this.jwt())
      .toPromise()
      .then(res => res.json() as Transaction)
      .catch(err => this.handleError(err));
  }

  createTransactionCustomerExists(type: string, customer_id: string): Promise<any> {
    let data = {
      transaction_type: type,
      customer: {
        _id: customer_id
      }
    };
    return this.http.post(this.backendUrl, data, this.jwt())
      .toPromise()
      .then(res => res.json() as Transaction)
      .catch(err => this.handleError(err));
  }

  deleteTransaction(transaction_id: string): Promise<any> {
    return this.http.delete(`${this.backendUrl}/${transaction_id}`, this.jwt())
      .toPromise()
      .then(res => this.transaction.next(null))
      .catch(err => this.handleError(err));
  }

  addNewBikeToTransaction(transaction_id: string, bike: Bike): Promise<any> {
    let data = {
      make: bike.make,
      model: bike.model,
      description: bike.description
    };
    return this.http.post(`${this.backendUrl}/${transaction_id}/bikes`, data, this.jwt())
      .toPromise()
      .then(res => this.transaction.next(res.json()))
      .catch(err => this.handleError(err));
  }

  addExistingBikeToTransaction(transaction_id: string, bike_id: string): Promise<any> {
    return this.http.post(`${this.backendUrl}/${transaction_id}/bikes`, {_id: bike_id}, this.jwt())
      .toPromise()
      .then(res => this.transaction.next(res.json()))
      .catch(err => this.handleError(err));
  }

  deleteBikeFromTransaction(transaction_id: string, bike_id: string): Promise<any> {
    return this.http.delete(`${this.backendUrl}/${transaction_id}/bikes/${bike_id}`, this.jwt())
      .toPromise()
      .then(res => this.transaction.next(res.json()))
      .catch(err => this.handleError(err));
  }

  addItemToTransaction(transaction_id: string, item_id: string): Promise<any> {
    return this.http.post(`${this.backendUrl}/${transaction_id}/items`, {_id: item_id}, this.jwt())
      .toPromise()
      .then(res => this.transaction.next(res.json()))
      .catch(err => this.handleError(err));
  }

  deleteItemFromTransaction(transaction_id: string, item_id: string): Promise<any> {
    return this.http.delete(`${this.backendUrl}/${transaction_id}/items/${item_id}`, this.jwt())
      .toPromise()
      .then(res => this.transaction.next(res.json()))
      .catch(err => this.handleError(err));
  }

  addRepairToTransaction(transaction_id: string, repair_id: string): Promise<any> {
    return this.http.post(`${this.backendUrl}/${transaction_id}/repairs`, {_id: repair_id}, this.jwt())
      .toPromise()
      .then(res => this.transaction.next(res.json()))
      .catch(err => this.handleError(err));
  }

  deleteRepairFromTransaction(transaction_id: string, repair_id: string): Promise<any> {
    return this.http.delete(`${this.backendUrl}/${transaction_id}/repairs/${repair_id}`, this.jwt())
      .toPromise()
      .then(res => this.transaction.next(res.json()))
      .catch(err => this.handleError(err));
  }
}
