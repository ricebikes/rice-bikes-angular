import { Injectable } from '@angular/core';
import { Transaction } from "../models/transaction";
import {BehaviorSubject, Observable} from "rxjs";
import 'rxjs/add/operator/toPromise';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import { Customer } from "../models/customer";
import { Bike } from "../models/bike";
import {Router} from "@angular/router";
import {AlertService} from "./alert.service";
import {CONFIG} from "../config";
import {HttpErrorResponse} from '@angular/common/http';
import {catchError, retry} from 'rxjs/operators';
import {User} from '../models/user';

@Injectable()
export class TransactionService {

  private backendUrl: string = `${CONFIG.api_url}/transactions`;

  public transaction: BehaviorSubject<Transaction>;

  constructor(private http: HttpClient, private router: Router, private alertService: AlertService) {
    this.transaction = new BehaviorSubject<Transaction>(null);
  }

  private makeheaders(user?: User) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser.token) {
      let headers = new HttpHeaders();
      headers = headers.set('x-access-token', currentUser.token);
      if (user) {headers = headers.set('user-id', user._id.toString()); }
      return {headers: headers };
    }
  }

  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      // client side or network error
      this.alertService.queueAlert(`An error occurred: ${error.error.message}`);
    } else {
      // backed encountered an error
      this.alertService.queueAlert(
        `Backend returned error code ${error.status}. ` +
        `Message was: ${error.message} (${error.error.error})`
      );
    }
    return Observable.throw(error);
  }



  /**
   * Requests transactions. Accepts an optional props object, which will append a query string with these values.
   * @param props
   * @returns {Promise<any>}
   */
  getTransactions(props?: any): Observable<any> {
    const querystring = '?' + Object.keys(props).map(k => `${k}=${encodeURIComponent(props[k])}`).join('&');
    return this.http.get(this.backendUrl + querystring, this.makeheaders())
      .pipe(
        retry(2),
        catchError((err) => {
        return this.handleError(err);
      })
      );
  }

  getTransaction(id: string): Observable<any> {
    return this.http.get(`${this.backendUrl}/${id}`, this.makeheaders())
      .pipe(
        retry(2),
        catchError((err) => {
        return this.handleError(err);
      })
      );
  }

  updateTransaction(transaction: Transaction): Observable<any> {
    return this.http.put(`${this.backendUrl}/${transaction._id}`, transaction, this.makeheaders())
      .pipe(
        retry(2),
        catchError((err) => {
        return this.handleError(err);
      })
      );
  }

  // updates a transaction's description, logging who initiated the change
  updateTransactionDescription(transaction: Transaction, user: User): Observable<any> {
    return this.http.put(`${this.backendUrl}/${transaction._id}/description`,
      {description: transaction.description},
      this.makeheaders(user)).pipe(
        retry(2),
        catchError( (err) => {
          return this.handleError(err);
        })
    );
  }
  // updates a transaction's complete status, logging who took the action
 updateTransactionComplete(transaction: Transaction, user: User): Observable<any> {
   return this.http.put(`${this.backendUrl}/${transaction._id}/complete`,
     {complete: transaction.complete},
     this.makeheaders(user)).pipe(
     retry(2),
     catchError( (err) => {
       return this.handleError(err);
     })
   );
 }
 // marks a transaction as finished, logging the action
 updateTransactionPaid(transaction: Transaction, user: User): Observable<any> {
   return this.http.put(`${this.backendUrl}/${transaction._id}/mark_paid`,
     {is_paid : transaction.is_paid },
     this.makeheaders(user)).pipe(
       retry(2),
       catchError( (err) => {
       return this.handleError(err);
       }
     )
   );
 }

  createTransaction(type: string, customer: Customer, user: User): Observable<any> {
    const data = {
      transaction_type: type,
      customer: {
        email: customer.email,
        first_name: customer.first_name,
        last_name: customer.last_name
      }
    };
    return this.http.post(this.backendUrl, data, this.makeheaders(user))
      .pipe(
        retry(2),
        catchError((err) => {
        return this.handleError(err);
      })
      );
  }

  createTransactionCustomerExists(type: string, customer_id: string, user: User): Observable<any> {
    const data = {
      transaction_type: type,
      customer: {
        _id: customer_id
      }
    };
    return this.http.post(this.backendUrl, data, this.makeheaders(user))
      .pipe(
        retry(2),
        catchError((err) => {
        return this.handleError(err);
      })
      );
  }

  deleteTransaction(transaction_id: string): Observable<any> {
    console.log(transaction_id);
    return this.http.delete(`${this.backendUrl}/${transaction_id}`, this.makeheaders()).pipe(
      catchError((err) => {
        return this.handleError(err);
      })
    );
  }

  addNewBikeToTransaction(transaction_id: string, bike: Bike): Observable<any> {
    let data = {
      make: bike.make,
      model: bike.model,
      description: bike.description
    };
    return this.http.post(`${this.backendUrl}/${transaction_id}/bikes`, data, this.makeheaders())
      .pipe(
        retry(2),
        catchError((err) => {
        return this.handleError(err);
      })
      );
  }

  addExistingBikeToTransaction(transaction_id: string, bike_id: string): Observable<any> {
    return this.http.post(`${this.backendUrl}/${transaction_id}/bikes`, {_id: bike_id}, this.makeheaders())
      .pipe(
        retry(2),
        catchError((err) => {
        return this.handleError(err);
      })
      );
  }

  deleteBikeFromTransaction(transaction_id: string, bike_id: string): Observable<any> {
    return this.http.delete(`${this.backendUrl}/${transaction_id}/bikes/${bike_id}`, this.makeheaders())
      .pipe(
        retry(2),
        catchError((err) => {
        return this.handleError(err);
      })
      );
  }

  addItemToTransaction(transaction_id: string, item_id: string, user: User): Observable<any> {
    return this.http.post(`${this.backendUrl}/${transaction_id}/items`, {_id: item_id }, this.makeheaders(user))
      .pipe(
        retry(2),
        catchError((err) => {
        return this.handleError(err);
      })
      );
  }

  deleteItemFromTransaction(transaction_id: string, item_id: string, user: User): Observable<any> {
    return this.http.delete(`${this.backendUrl}/${transaction_id}/items/${item_id}`, this.makeheaders(user))
      .pipe(
        retry(2),
        catchError((err) => {
        return this.handleError(err);
      })
      );
  }

  updateRepairInTransaction(transaction_id: string, repair_id: string, user: User, completed: boolean) {
    return this.http.put(`${this.backendUrl}/${transaction_id}/update_repair`, {_id: repair_id, completed: completed},
      this.makeheaders(user)).pipe(
        retry(2),
        catchError( (err) => {
          return this.handleError(err);
        })
    );
  }

  addRepairToTransaction(transaction_id: string, repair_id: string, user: User): Observable<any> {
    return this.http.post(`${this.backendUrl}/${transaction_id}/repairs`, {_id: repair_id }, this.makeheaders(user))
      .pipe(
        retry(2),
        catchError((err) => {
        return this.handleError(err);
      })
      );
  }

  deleteRepairFromTransaction(transaction_id: string, repair_id: string, user: User): Observable<any> {
    return this.http.delete(`${this.backendUrl}/${transaction_id}/repairs/${repair_id}`, this.makeheaders(user))
      .pipe(
        retry(2),
        catchError((err) => {
        return this.handleError(err);
      })
      );
  }

  notifyCustomerEmail(transaction_id: string): Observable<any> {
    return this.http.get(`${this.backendUrl}/${transaction_id}/email-notify`, this.makeheaders())
      .pipe(
        retry(2),
        catchError((err) => {
        return this.handleError(err);
      })
      );
  }
}
