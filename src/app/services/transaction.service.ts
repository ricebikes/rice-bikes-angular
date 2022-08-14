import { Injectable } from "@angular/core";
import { Transaction } from "../models/transaction";
import { BehaviorSubject } from "rxjs/BehaviorSubject";
import "rxjs/add/operator/toPromise";
import { Customer } from "../models/customer";
import { Bike } from "../models/bike";
import { Router } from "@angular/router";
import { AlertService } from "./alert.service";
import { CONFIG } from "../config";
import { AuthenticationService } from "./authentication.service";
import { HttpErrorResponse } from "@angular/common/http";
import { Http } from "@angular/http";
import { OrderRequest } from "../models/orderRequest";

@Injectable()
export class TransactionService {
  private backendUrl = `${CONFIG.api_url}/transactions`;

  public transaction: BehaviorSubject<Transaction>;

  constructor(
    private http: Http,
    private router: Router,
    private alertService: AlertService,
    private authService: AuthenticationService
  ) {
    this.transaction = new BehaviorSubject<Transaction>(null);
  }

  private handleError(err: HttpErrorResponse): void {
    let message = err.message;
    if (!message) {
      message = JSON.stringify(err);
    }
    this.alertService.error(err.statusText, message, err.status);
  }

  /**
   * Requests transactions. Accepts an optional props object, which will append a query string with these values.
   * @param props
   * @returns {Promise<any>}
   */
  getTransactions(props?: any): Promise<any> {
    const querystring =
      "?" +
      Object.keys(props)
        .map((k) => `${k}=${encodeURIComponent(props[k])}`)
        .join("&");
    return this.authService.getCredentials().then((credentials) => {
      return this.http
        .get(this.backendUrl + querystring, credentials)
        .toPromise()
        .then((res) => res.json() as Transaction[])
        .catch((err) => this.handleError(err));
    });
  }

  getTransaction(id: string): Promise<any> {
    return this.authService.getCredentials().then((credentials) => {
      return this.http
        .get(`${this.backendUrl}/${id}`, credentials)
        .toPromise()
        .then((res) => {
          this.transaction.next(res.json() as Transaction);
          return res.json() as Transaction;
        })
        .catch((err) => this.handleError(err));
    });
  }

  updateTransaction(transaction: Transaction): Promise<any> {
    return this.authService.getCredentials().then((credentials) => {
      return this.http
        .put(`${this.backendUrl}/${transaction._id}`, transaction, credentials)
        .toPromise()
        .then((res) => this.transaction.next(res.json() as Transaction))
        .catch((err) => this.handleError(err));
    });
  }

  /**
   * Gets a list of all transaction IDs known to the backend.
   */
  getTransactionIDs(): Promise<any> {
    return this.authService.getCredentials().then((cred) => {
      return this.http
        .get(`${this.backendUrl}/search/ids`, cred)
        .toPromise()
        .then((res) => res.json() as Number[])
        .catch((err) => this.handleError(err));
    });
  }

  updateDescription(id: string, description: string): Promise<any> {
    return this.authService.getUserCredentials().then((credentials) => {
      return this.http
        .put(
          `${this.backendUrl}/${id}/description`,
          { description: description },
          credentials
        )
        .toPromise()
        .then((res) => this.transaction.next(res.json() as Transaction))
        .catch((err) => this.handleError(err));
    });
  }

  updateCustomer(id: string, customer:Customer):Promise<any> {
    return this.authService.getUserCredentials().then((credentials) => {
      return this.http
        .put(
          `${this.backendUrl}/${id}/customer`,
          { customer },
          credentials
        )
        .toPromise()
        .then((res) => this.transaction.next(res.json() as Transaction))
        .catch((err) => this.handleError(err));
    })
  }

  setComplete(id: string, complete: boolean): Promise<any> {
    return this.authService.getUserCredentials().then((credentials) => {
      return this.http
        .put(
          `${this.backendUrl}/${id}/complete`,
          { complete: complete },
          credentials
        )
        .toPromise()
        .then((res) => this.transaction.next(res.json() as Transaction))
        .catch((err) => this.handleError(err));
    });
  }

  setPaid(id: string, paid: boolean): Promise<any> {
    return this.authService.getUserCredentials().then((credentials) => {
      return this.http
        .put(
          `${this.backendUrl}/${id}/mark_paid`,
          { is_paid: paid },
          credentials
        )
        .toPromise()
        .then((res) => this.transaction.next(res.json() as Transaction))
        .catch((err) => this.handleError(err));
    });
  }

  updateRepair(
    transactionID: string,
    repairID: string,
    completed: boolean
  ): Promise<any> {
    return this.authService.getUserCredentials().then((credentials) => {
      return this.http
        .put(
          `${this.backendUrl}/${transactionID}/update_repair`,
          { _id: repairID, completed: completed },
          credentials
        )
        .toPromise()
        .then((res) => this.transaction.next(res.json() as Transaction))
        .catch((err) => this.handleError(err));
    });
  }

  createTransaction(type: string, customer: Customer): Promise<any> {
    const data = {
      transaction_type: type,
      customer
    };
    return this.authService.getUserCredentials().then((credentials) => {
      return this.http
        .post(this.backendUrl, data, credentials)
        .toPromise()
        .then((res) => res.json() as Transaction)
        .catch((err) => this.handleError(err));
    });
  }

  deleteTransaction(transaction_id: string): Promise<any> {
    return this.authService.getCredentials().then((credentials) => {
      return this.http
        .delete(`${this.backendUrl}/${transaction_id}`, credentials)
        .toPromise()
        .then((res) => this.transaction.next(null))
        .catch((err) => this.handleError(err));
    });
  }

  addNewBikeToTransaction(transaction_id: string, bike: Bike): Promise<any> {
    const data = {
      make: bike.make,
      model: bike.model,
      description: bike.description,
    };
    return this.authService.getCredentials().then((credentials) => {
      return this.http
        .post(`${this.backendUrl}/${transaction_id}/bikes`, data, credentials)
        .toPromise()
        .then((res) => res.json() as Transaction)
        .catch((err) => this.handleError(err));
    });
  }

  addExistingBikeToTransaction(
    transaction_id: string,
    bike_id: string
  ): Promise<any> {
    return this.authService.getCredentials().then((credentials) => {
      return this.http
        .post(
          `${this.backendUrl}/${transaction_id}/bikes`,
          { _id: bike_id },
          credentials
        )
        .toPromise()
        .then((res) => this.transaction.next(res.json()))
        .catch((err) => this.handleError(err));
    });
  }

  deleteBikeFromTransaction(
    transaction_id: string,
    bike_id: string
  ): Promise<any> {
    return this.authService.getCredentials().then((credentials) => {
      return this.http
        .delete(
          `${this.backendUrl}/${transaction_id}/bikes/${bike_id}`,
          credentials
        )
        .toPromise()
        .then((res) => this.transaction.next(res.json()))
        .catch((err) => this.handleError(err));
    });
  }

  addItemToTransaction(transaction_id: string, item_id: string, custom_price?: number): Promise<any> {
    return this.authService.getUserCredentials().then((credentials) => {
      let query = { _id: item_id };
      if (custom_price) query["custom_price"] = parseFloat(custom_price.toFixed(2));
      return this.http
        .post(
          `${this.backendUrl}/${transaction_id}/items`,
          query,
          credentials
        )
        .toPromise()
        .then((res) => this.transaction.next(res.json()))
        .catch((err) => this.handleError(err));
    });
  }

  deleteItemFromTransaction(
    transaction_id: string,
    item_id: string
  ): Promise<any> {
    return this.authService.getUserCredentials().then((credentials) => {
      return this.http
        .delete(
          `${this.backendUrl}/${transaction_id}/items/${item_id}`,
          credentials
        )
        .toPromise()
        .then((res) => this.transaction.next(res.json()))
        .catch((err) => this.handleError(err));
    });
  }

  addRepairToTransaction(
    transaction_id: string,
    repair_id: string
  ): Promise<any> {
    return this.authService.getUserCredentials().then((credentials) => {
      return this.http
        .post(
          `${this.backendUrl}/${transaction_id}/repairs`,
          { _id: repair_id },
          credentials
        )
        .toPromise()
        .then((res) => this.transaction.next(res.json()))
        .catch((err) => this.handleError(err));
    });
  }

  deleteRepairFromTransaction(
    transaction_id: string,
    repair_id: string
  ): Promise<any> {
    return this.authService.getUserCredentials().then((credentials) => {
      return this.http
        .delete(
          `${this.backendUrl}/${transaction_id}/repairs/${repair_id}`,
          credentials
        )
        .toPromise()
        .then((res) => this.transaction.next(res.json()))
        .catch((err) => this.handleError(err));
    });
  }

  notifyCustomerEmail(transaction_id: string): Promise<any> {
    return this.authService.getCredentials().then((credentials) => {
      return this.http
        .get(`${this.backendUrl}/${transaction_id}/email-notify`, credentials)
        .toPromise()
        .then((res) => res.json())
        .catch((err) => this.handleError(err));
    });
  }

  setBeerBike(transaction_id: string, beerbike: boolean): Promise<any> {
      return this.authService.getUserCredentials().then((credentials) => {
          return this.http
            .put(`${this.backendUrl}/${transaction_id}/beerbike`, 
                 { beerbike: beerbike },
                 credentials)
            .toPromise()
            .then((res) => this.transaction.next(res.json()))
            .catch((err) => this.handleError(err));
      });
  }
}
