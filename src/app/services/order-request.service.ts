import { Injectable } from "@angular/core";
import { CONFIG } from "../config";
import { Http } from "@angular/http";
import { AlertService } from "./alert.service";
import { OrderRequest } from "../models/orderRequest";
import { AuthenticationService } from "./authentication.service";
import { HttpErrorResponse } from "@angular/common/http";
import { Item } from "../models/item";

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
    category_1: string,
    category_2: string,
    category_3: string,
    item: Item,
    transactions?: number[],
  ): Promise<OrderRequest> {
    const body = {
      quantity: quantity,
      request: request,
      categories: [category_1, category_2, category_3],
    };
    if (transactions) {
      body["transactions"] = transactions;
    }
    if (item) {
      body["item_id"] = item._id;
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
   * Adds a transaction to an order request. Transaction will also have the order request added to it.
   * @param orderReq Order request to add transaction to
   * @param transaction_id Transaction ID to add to order request
   */
  addTransaction(
    orderReq: OrderRequest,
    transaction_id: string
  ): Promise<OrderRequest> {
    return this.authService.getUserCredentials().then(credentials => {
      return this.http
        .post(`${this.backendURL}/${orderReq._id}/transaction`,
          { transaction_id: transaction_id },
          credentials
        ).toPromise()
        .then(res => res.json() as OrderRequest)
        .catch(err => { this.handleError(err); return null; })
    })
  }

  removeTransaction(
    orderReq: OrderRequest,
    transaction_id: string
  ): Promise<OrderRequest> {
    return this.authService.getUserCredentials().then(cred => {
      return this.http
        .delete(
          `${this.backendURL}/${orderReq._id}/transaction/${transaction_id}`,
          cred
        ).toPromise()
        .then(res => res.json() as OrderRequest)
        .catch(err => { this.handleError(err); return null });
    })
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
   * Set the item for an order request
   * @param orderReq: order request to update
   * @param item: item to associate with it
   */
  setItem(orderReq: OrderRequest, item: Item): Promise<OrderRequest> {
    console.log('set item', orderReq, item)
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
   * Complete a request and add parts to transactions
   */
  completeRequest(orderReq: OrderRequest): Promise<void> {
    return this.authService.getUserCredentials().then((cred) => {
      return this.http.put(
        `${this.backendURL}/${orderReq._id}/status`,
        { id: orderReq._id, status: 'Completed' },
        cred
      )
        .toPromise()
        .then((res) => res.json())
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
