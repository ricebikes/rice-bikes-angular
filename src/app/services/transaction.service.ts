import { Injectable } from '@angular/core';
import { Transaction } from "../models/transaction";
import { BehaviorSubject } from "rxjs";
import 'rxjs/add/operator/toPromise';
import { Headers, Http } from "@angular/http";
import {Customer} from "../models/customer";

@Injectable()
export class TransactionService {

  private backendUrl: string = 'http://localhost:5000/api/transaction';

  public transaction: BehaviorSubject<Transaction>;
  private headers = new Headers({'Content-Type': 'application/json'});

  constructor(private http: Http) {
    this.transaction = new BehaviorSubject<Transaction>(null);
  }

  getTransactions(): Promise<Transaction[]> {
    return this.http.get(this.backendUrl, this.headers)
      .toPromise()
      .then(res => res.json().objects as Transaction[])
  }

  getTransaction(id: number): void {
    this.http.get(`${this.backendUrl}/${id}`, this.headers)
      .map(res => res.json() as Transaction)
      .subscribe(transaction => this.transaction.next(transaction));
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
    return this.http.post(this.backendUrl, data, {headers: this.headers})
      .toPromise()
      .then(res => res.json() as Transaction);
  }

  createTransactionCustomerExists(type: string, customer_id: number): Promise<any> {
    return this.http.post(this.backendUrl, {transaction_type: type, customer_id: customer_id}, {headers: this.headers})
      .toPromise()
      .then(res => res.json() as Transaction);
  }

  addObjectToTransaction(transaction_id: number, obj_name: string, obj_id: number): Promise<any> {
    return this.http.put(`${this.backendUrl}/${transaction_id}`, `{\"${obj_name}\": {"add": [{"id": ${obj_id}}]}}`, {headers: this.headers})
      .toPromise()
      .then(res => {
        this.transaction.next(res.json());
      })
  }
}
