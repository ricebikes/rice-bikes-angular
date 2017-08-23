import { Injectable } from '@angular/core';
import { Transaction } from "../models/transaction";
import { BehaviorSubject } from "rxjs";
import 'rxjs/add/operator/toPromise';
import { Headers, Http } from "@angular/http";

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
      .then(res => res.json().objects)
  }

  getTransaction(id: number): void {
    this.http.get(`${this.backendUrl}/${id}`, this.headers)
      .toPromise()
      .then(transaction => this.transaction.next(transaction));
  }

  createTransaction(type: string): Promise<any> {
    return this.http.post(this.backendUrl, {transaction_type: type}, {headers: this.headers})
      .toPromise()
      .then(transaction => this.transaction.next(transaction))
  }

}
