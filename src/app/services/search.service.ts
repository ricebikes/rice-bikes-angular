import { Injectable } from '@angular/core';
import {Http, URLSearchParams, RequestOptions, Headers} from '@angular/http';
import {Observable} from "rxjs";
import {Customer} from "../models/customer";
import {RepairItem} from "../models/repairItem";
import {Item} from "../models/item";
import {Transaction} from "../models/transaction";
import {CONFIG} from "../config";

@Injectable()
export class SearchService {

  private transactionUrl: string = `${CONFIG.api_url}/transactions/search`;
  private customerUrl: string = `${CONFIG.api_url}/customers/search`;
  private repairUrl: string = `${CONFIG.api_url}/repairs/search`;
  private itemUrl: string = `${CONFIG.api_url}/items/search`;

  constructor(private http: Http) {}


  private jwt_headers() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser.token) {
      const headers = new Headers({'x-access-token': currentUser.token});
      return headers;
    }
  }
  /**
   * Searches for transactions, looking in the given field for the given term.
   * @param field - one of {bike, customer, description}
   * @param term - term to search for
   * @returns {Observable<R>}
   */
  transactionSearch(field: string, term: string): Observable<Transaction[]> {
    let requestOptions = new RequestOptions();
    let params = new URLSearchParams();
    params.set(field, term);
    requestOptions.params = params;
    return this.http.get(this.transactionUrl, requestOptions)
      .map(res => res.json() as Transaction[]);
  }

  customerSearch(term: string): Observable<Customer[]> {
    let params = new URLSearchParams();
    let requestOptions = new RequestOptions();
    params.set('q', "\"" + term + "\"");
    requestOptions.params = params;
    return this.http.get(this.customerUrl, requestOptions)
      .map(res => res.json() as Customer[])
  }

  repairSearch(term: string): Observable<RepairItem[]> {
    let params = new URLSearchParams();
    let requestOptions = new RequestOptions();
    params.set('q', term);
    requestOptions.params = params;
    requestOptions.headers = this.jwt_headers();
    return this.http.get(this.repairUrl, requestOptions)
      .map(res => res.json() as RepairItem[])
  }

  itemSearch(term: string): Observable<Item[]> {
    let params = new URLSearchParams();
    let requestOptions = new RequestOptions();
    params.set('q', term);
    requestOptions.params = params;
    return this.http.get(this.itemUrl, requestOptions)
      .map(res => res.json() as Item[])
  }

}
