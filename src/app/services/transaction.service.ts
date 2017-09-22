import { Injectable } from '@angular/core';
import { Transaction } from "../models/transaction";
import { BehaviorSubject } from "rxjs";
import 'rxjs/add/operator/toPromise';
import {Headers, Http, RequestOptions} from "@angular/http";
import { Customer } from "../models/customer";
import { Bike } from "../models/bike";

@Injectable()
export class TransactionService {

  private backendUrl: string = 'http://localhost:3000/transactions';

  public transaction: BehaviorSubject<Transaction>;

  constructor(private http: Http) {
    this.transaction = new BehaviorSubject<Transaction>(null);
  }

  private jwt() {
    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser && currentUser.token) {
      let headers = new Headers({ 'Authorization': 'Bearer ' + currentUser.token });
      return new RequestOptions({ headers: headers });
    }
  }

  getTransactions(): Promise<Transaction[]> {
    return this.http.get(this.backendUrl, this.jwt())
      .toPromise()
      .then(res => res.json() as Transaction[])
  }

  getActiveTransactions(): Promise<any> {
    return this.http.get(`${this.backendUrl}/active`, this.jwt())
      .toPromise()
      .then(res => res.json() as Transaction[])
  }

  getCompletedTransactions(): Promise<any>{
    return this.http.get(`${this.backendUrl}/complete`, this.jwt())
      .toPromise()
      .then(res => res.json() as Transaction[])
  }

  getTransaction(id: string): void {
    this.http.get(`${this.backendUrl}/${id}`, this.jwt())
      .map(res => res.json() as Transaction)
      .subscribe(transaction => this.transaction.next(transaction));
  }

  updateTransaction(transaction: Transaction): Promise<any> {
    return this.http.put(`${this.backendUrl}/${transaction._id}`, transaction, this.jwt())
      .toPromise()
      .then(res => this.transaction.next(res.json() as Transaction));
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
      .then(res => res.json() as Transaction);
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
      .then(res => res.json() as Transaction);
  }

  deleteTransaction(transaction_id: string): Promise<any> {
    return this.http.delete(`${this.backendUrl}/${transaction_id}`, this.jwt())
      .toPromise()
      .then(res => this.transaction.next(null));
  }

  addNewBikeToTransaction(transaction_id: string, bike: Bike): Promise<any> {
    let data = {
      make: bike.make,
      model: bike.model,
      description: bike.description
    };
    return this.http.post(`${this.backendUrl}/${transaction_id}/bikes`, data, this.jwt())
      .toPromise()
      .then(res => this.transaction.next(res.json()));
  }

  addExistingBikeToTransaction(transaction_id: string, bike_id: string): Promise<any> {
    return this.http.post(`${this.backendUrl}/${transaction_id}/bikes`, {_id: bike_id}, this.jwt())
      .toPromise()
      .then(res => this.transaction.next(res.json()));
  }

  deleteBikeFromTransaction(transaction_id: string, bike_id: string): Promise<any> {
    return this.http.delete(`${this.backendUrl}/${transaction_id}/bikes/${bike_id}`, this.jwt())
      .toPromise()
      .then(res => this.transaction.next(res.json()));
  }

  addItemToTransaction(transaction_id: string, item_id: string): Promise<any> {
    return this.http.post(`${this.backendUrl}/${transaction_id}/items`, {_id: item_id}, this.jwt())
      .toPromise()
      .then(res => this.transaction.next(res.json()));
  }

  deleteItemFromTransaction(transaction_id: string, item_id: string): Promise<any> {
    return this.http.delete(`${this.backendUrl}/${transaction_id}/items/${item_id}`, this.jwt())
      .toPromise()
      .then(res => this.transaction.next(res.json()));
  }

  addRepairToTransaction(transaction_id: string, repair_id: string): Promise<any> {
    return this.http.post(`${this.backendUrl}/${transaction_id}/repairs`, {_id: repair_id}, this.jwt())
      .toPromise()
      .then(res => this.transaction.next(res.json()));
  }

  deleteRepairFromTransaction(transaction_id: string, repair_id: string): Promise<any> {
    return this.http.delete(`${this.backendUrl}/${transaction_id}/repairs/${repair_id}`, this.jwt())
      .toPromise()
      .then(res => this.transaction.next(res.json()));
  }
}
