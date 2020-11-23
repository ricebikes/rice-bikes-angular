import { Injectable } from "@angular/core";
import { CONFIG } from "../config";
import { Http } from "@angular/http";
import { AlertService } from "./alert.service";
import { OrderRequest } from "../models/orderRequest";
import { AuthenticationService } from "./authentication.service";
import { HttpErrorResponse } from "@angular/common/http";
import { Item } from "../models/item";
import { Transaction } from "../models/transaction";

@Injectable()
export class OrderRequestService {
  private backendURL = `${CONFIG.api_url}/order-requests`;

  constructor(
    private http: Http,
    private alertService: AlertService,
    private authService: AuthenticationService
  ) { }

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
    return this.authService.getCredentials().then((cred) => {
      return this.http
        .get(`${this.backendURL}/latest/${n}`, cred)
        .toPromise()
        .then((res) => res.json() as OrderRequest[])
        .catch((err) => {
          this.handleError(err);
          return null;
        });
    });
  }

  /**
   * Gets all active order requests: Those with status "Not Ordered" and "In Cart"
   */
  getActiveRequests(): Promise<OrderRequest[]> {
    return this.authService.getCredentials().then((cred) => {
      return this.http.get(`${this.backendURL}/?active=true`, cred)
        .toPromise()
        .then((res) => res.json() as OrderRequest[])
        .catch(err => {
          this.handleError(err);
          return null;
        })
    })
  }

  /**
   * Create an order request
   * @param quantity: quantity of item requested
   * @param request: string describing the item requested
   * @param partNum: part number of the item request (optional)
   * @param transactions: transaction IDs, if any, that the item is requested for (optional)
   * @param item: item that will be ordered (optional)
   */
  createOrderReq(
    quantity: number,
    request: string,
    partNum?: string,
    transactions?: number[],
    item?: Item
  ): Promise<OrderRequest> {
    const body = {
      quantity: quantity,
      request: request,
    };
    if (partNum) {
      body["partNum"] = partNum;
    }
    if (transactions) {
      body["transactions"] = transactions;
    }
    if (item) {
      body["item"] = item;
    }
    return this.authService.getUserCredentials().then((cred) => {
      return this.http
        .post(this.backendURL, body, cred)
        .toPromise()
        .then((res) => res.json() as OrderRequest)
        .catch((err) => {
          this.handleError(err);
          return null;
        });
    });
  }

  /**
   * Gets all distinct IDs of order requests in the database.
   */
  getDistinctIDs(): Promise<number[]> {
    return this.authService.getCredentials().then((cred) => {
      return this.http.get(`${this.backendURL}/distinct-ids`, cred).toPromise().then(res => res.json() as number[])
        .catch(err => { this.handleError(err); return null });
    });
  }

  /**
   * Sets the request string for an OrderRequest
   * @param orderReq: request to update
   * @param request: new string to set for Order Request
   */
  setRequestString(
    orderReq: OrderRequest,
    request: string
  ): Promise<OrderRequest> {
    return this.authService.getUserCredentials().then((cred) => {
      return this.http
        .put(
          `${this.backendURL}/${orderReq._id}/request`,
          { request: request },
          cred
        )
        .toPromise()
        .then((res) => res.json() as OrderRequest)
        .catch((err) => {
          this.handleError(err);
          return null;
        });
    });
  }

  /**
   * Sets the part number string for an OrderRequest
   * @param orderReq: request to update
   * @param partNumber: new part number to set for Order Request
   */
  setPartNum(
    orderReq: OrderRequest,
    partNumber: string
  ): Promise<OrderRequest> {
    return this.authService.getUserCredentials().then((cred) => {
      return this.http
        .put(
          `${this.backendURL}/${orderReq._id}/partnumber`,
          { partNum: partNumber },
          cred
        )
        .toPromise()
        .then((res) => res.json() as OrderRequest)
        .catch((err) => {
          this.handleError(err);
          return null;
        });
    });
  }

  /**
   * Sets the notes string for an OrderRequest
   * @param orderReq: request to update
   * @param partNumber: new notes string to set for Order Request
   */
  setNotes(
    orderReq: OrderRequest,
    notes: string
  ): Promise<OrderRequest> {
    return this.authService.getUserCredentials().then((cred) => {
      return this.http
        .put(
          `${this.backendURL}/${orderReq._id}/notes`,
          { notes: notes },
          cred
        )
        .toPromise()
        .then((res) => res.json() as OrderRequest)
        .catch((err) => {
          this.handleError(err);
          return null;
        });
    });
  }

  /**
   * Sets the quantity of an order request requested
   * @param orderReq: Order Request
   * @param quantity: quantity to set
   */
  setQuantity(orderReq: OrderRequest, quantity: number): Promise<OrderRequest> {
    return this.authService.getUserCredentials().then((cred) => {
      return this.http
        .put(
          `${this.backendURL}/${orderReq._id}/quantity`,
          { quantity: quantity },
          cred
        )
        .toPromise()
        .then((res) => res.json() as OrderRequest)
        .catch((err) => {
          this.handleError(err);
          return null;
        });
    });
  }

  /**
   * Set the transaction for an order request
   * @param orderReq: order request to update
   * @param transactions: array of transactions to associate
   */
  setTransactions(
    orderReq: OrderRequest,
    transactions: Transaction[]
  ): Promise<OrderRequest> {
    return this.authService.getUserCredentials().then((cred) => {
      return this.http
        .put(
          `${this.backendURL}/${orderReq._id}/transactions`,
          { transactions: transactions },
          cred
        )
        .toPromise()
        .then((res) => res.json() as OrderRequest)
        .catch((err) => {
          this.handleError(err);
          return null;
        });
    });
  }

  /**
   * Set the item for an order request
   * @param orderReq: order request to update
   * @param item: item to associate with it
   */
  setItem(orderReq: OrderRequest, item: Item): Promise<OrderRequest> {
    return this.authService.getUserCredentials().then((cred) => {
      return this.http
        .put(
          `${this.backendURL}/${orderReq._id}/item`,
          { item_id: item._id },
          cred
        )
        .toPromise()
        .then((res) => res.json() as OrderRequest)
        .catch((err) => {
          this.handleError(err);
          return null;
        });
    });
  }


  /**
   * Deletes an Order Request from the database
   * @param orderReq: Order Request to delete
   */
  deleteRequest(orderReq: OrderRequest): Promise<void> {
    return this.authService.getCredentials().then((cred) => {
      return this.http
        .delete(`${this.backendURL}/${orderReq._id}`, cred)
        .toPromise()
        .catch((err) => {
          this.handleError(err);
          return null;
        });
    });
  }
}
