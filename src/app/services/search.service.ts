import { Injectable } from "@angular/core";
import { Http, URLSearchParams, RequestOptions, Headers } from "@angular/http";
import { Customer } from "../models/customer";
import { RepairItem } from "../models/repairItem";
import { Item } from "../models/item";
import { Transaction } from "../models/transaction";
import { CONFIG } from "../config";
import { Observable } from "rxjs/Observable";
import { Repair } from "../models/repair";
import { HttpErrorResponse, HttpParams } from "@angular/common/http";
import { AlertService } from "./alert.service";
import { Bike } from "../models/bike";

@Injectable()
export class SearchService {
  private transactionUrl = `${CONFIG.api_url}/transactions/search`;
  private customerUrl = `${CONFIG.api_url}/customers/search`;
  private repairUrl = `${CONFIG.api_url}/repairs/search`;
  private itemUrl = `${CONFIG.api_url}/items`;
  private bikeUrl = `${CONFIG.api_url}/bikes/search`;

  constructor(private http: Http, private alertService: AlertService) {}

  private static jwt_headers() {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (currentUser.token) {
      return new Headers({ "x-access-token": currentUser.token });
    }
  }

  private handleError(err: HttpErrorResponse): void {
    let message = err.message;
    if (!message) {
      message = JSON.stringify(err);
    }
    this.alertService.error(err.statusText, message, err.status);
  }

  /**
   * Searches for transactions
   * @param customers: Array of customers. Matched transactions will have one customer from the array.
   * @param bikes: Array of bikes. Matched transactions will have at least one customer from the array.
   * @param description: Description of the transaction. Matched transactions will contain all words in this string.
   * @returns {Promise}
   */
  transactionSearch(
    customers?: Customer[],
    bikes?: Bike[],
    description?: string
  ): Promise<Transaction[]> {
    const requestOptions = new RequestOptions();
    const params = new URLSearchParams();
    requestOptions.headers = SearchService.jwt_headers();
    if (customers)
      params.set(
        "customers",
        customers.map((customer) => customer._id).toString()
      );
    if (bikes) params.set("bikes", bikes.map((bike) => bike._id).toString());
    if (description) params.set("description", description);
    requestOptions.params = params;
    return this.http
      .get(this.transactionUrl, requestOptions)
      .toPromise()
      .then((res) => res.json() as Transaction[])
      .catch((err) => {
        this.handleError(err);
        return null;
      });
  }

  customerSearch(term: string): Observable<Customer[]> {
    const params = new URLSearchParams();
    const requestOptions = new RequestOptions();
    requestOptions.headers = SearchService.jwt_headers();
    params.set("q", '"' + term + '"');
    requestOptions.params = params;
    return this.http
      .get(this.customerUrl, requestOptions)
      .map((res) => res.json() as Customer[]);
  }

  repairSearch(term: string): Observable<Repair[]> {
    const params = new URLSearchParams();
    const requestOptions = new RequestOptions();
    params.set("q", term);
    requestOptions.params = params;
    requestOptions.headers = SearchService.jwt_headers();
    return this.http
      .get(this.repairUrl, requestOptions)
      .map((res) => res.json() as Repair[]);
  }

  bikeSearch(
    make?: string,
    model?: string,
    searchString?: string
  ): Promise<Bike[]> {
    const params = new URLSearchParams();
    if (make) params.set("make", make);
    if (model) params.set("model", model);
    if (searchString) params.set("search", searchString);
    const requestOptions = new RequestOptions();
    requestOptions.headers = SearchService.jwt_headers();
    requestOptions.params = params;
    return this.http
      .get(this.bikeUrl, requestOptions)
      .toPromise()
      .then((res) => res.json() as Bike[])
      .catch((err) => {
        this.handleError(err);
        return null;
      });
  }

  /**
   * Gets all distinct transaction IDs. Useful for quick searching.
   */
  getTransactionIDs(): Promise<string[]> {
    const requestOptions = new RequestOptions();
    requestOptions.headers = SearchService.jwt_headers();
    return this.http
      .get(`${this.transactionUrl}/ids`, requestOptions)
      .toPromise()
      .then((res) => res.json() as string[])
      .catch((err) => {
        this.handleError(err);
        return null;
      });
  }

  /**
   * Searches for item by given parameters, returns an observable of results
   * @param name: name of item
   * @param category: item category (old)
   * @param category_1: item category 1
   * @param category_2: item category 2
   * @param category_3: item category 3
   * @param brand: item brand
   * @param condition: item condition (New or Used)
   */
  itemSearch(
    name?: string,
    category?: string,
    category_1?: string,
    category_2?: string,
    category_3?: string,
    brand?: string
  ): Promise<Item[]> {
    const params = new URLSearchParams();
    const requestOptions = new RequestOptions();
    requestOptions.headers = SearchService.jwt_headers();
    if (name) {
      params.set("name", name);
    }
    if (category) {
      params.set("category", category);
    } // TO BE REMOVED IN ITEM MIGRATION
    else {
      if (category_3) {
        params.set("category_1", category_1);
      }
      if (category_2) {
        params.set("category_2", category_2);
      }
      if (category_3) {
        params.set("category_3", category_3);
      }
    }
    if (brand) {
      params.set("brand", brand);
    }
    requestOptions.params = params;
    return this.http
      .get(`${this.itemUrl}/search`, requestOptions)
      .toPromise()
      .then((res) => res.json() as Item[])
      .catch((err) => {
        this.handleError(err);
        return null;
      });
  }

  /**
   * Searches for an item by the UPC only. It is expected that there will only be one item returned here.
   * @param upc
   */
  upcSearch(upc: string): Promise<Item> {
    const requestOptions = new RequestOptions();
    requestOptions.headers = SearchService.jwt_headers();
    return this.http
      .put(`${this.itemUrl}/upc/${upc}`, {}, requestOptions)
      .toPromise()
      .then((res) => res.json() as Item)
      .catch((err) => {
        this.handleError(err);
        return null;
      });
  }

  /**
   * Gets distinct item categories
   */
  itemCategories1(): Promise<string[]> {
    return this.http
      .get(
        `${this.itemUrl}/categories`,
        new RequestOptions({ headers: SearchService.jwt_headers() })
      )
      .toPromise()
      .then((res) => Object.keys(res.json()))
      .catch((err) => this.handleError(err));
  }

  /**
   * Gets distinct item sub-categories
   */
  itemCategories2(cat1?: string): Promise<string[]> {
    if (cat1 != null) {
      return this.http
        .get(
          `${this.itemUrl}/categories`,
          new RequestOptions({ headers: SearchService.jwt_headers() })
        )
        .toPromise()
        .then((res) => Object.keys(res.json()[cat1]));
    }
    // let category2 = [];
    // console.log("null");
    // return this.http.get(`${this.itemUrl}/categories`,
    // new RequestOptions({headers: SearchService.jwt_headers() }))
    // .toPromise()
    // .then(res => {
    //   for(let cat in this.itemCategories1()) {
    //     category2.push(Object.keys(res.json()[cat]))
    //   }
    //   console.log(category2);
    //   return null;
    // })
    // .catch(err=> this.handleError(err));
  }

  /**
   * Gets distinct item sub-sub-categories
   */
  itemCategories3(cat1: string, cat2: string): Promise<string[]> {
    return this.http
      .get(
        `${this.itemUrl}/categories`,
        new RequestOptions({ headers: SearchService.jwt_headers() })
      )
      .toPromise()
      .then((res) => Object.keys(res.json()[cat1][cat2]))
      .catch((err) => this.handleError(err));
  }

  /**
   * Gets distinct item brands known to database
   */
  itemBrands(): Promise<String[]> {
    return this.http
      .get(
        `${this.itemUrl}/brands`,
        new RequestOptions({ headers: SearchService.jwt_headers() })
      )
      .toPromise()
      .then((res) => res.json().sort())
      .catch((err) => this.handleError(err));
  }

  /**
   * Gets distinct item sizes given a specific category
   * @param category: Item category to search with
   */
  itemSizes(category: string): Promise<String[]> {
    const params = new URLSearchParams();
    const requestOptions = new RequestOptions();
    requestOptions.headers = SearchService.jwt_headers();
    params.set("category", category);
    requestOptions.params = params;
    return this.http
      .get(`${this.itemUrl}/sizes`, requestOptions)
      .toPromise()
      .then((res) => res.json().sort())
      .catch((err) => this.handleError(err));
  }
}
