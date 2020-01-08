import { Injectable } from '@angular/core';
import {Http, URLSearchParams, RequestOptions, Headers} from '@angular/http';
import {Customer} from '../models/customer';
import {RepairItem} from '../models/repairItem';
import {Item} from '../models/item';
import {Transaction} from '../models/transaction';
import {CONFIG} from '../config';
import {Observable} from 'rxjs/Observable';

@Injectable()
export class SearchService {

  private transactionUrl = `${CONFIG.api_url}/transactions/search`;
  private customerUrl = `${CONFIG.api_url}/customers/search`;
  private repairUrl = `${CONFIG.api_url}/repairs/search`;
  private itemUrl = `${CONFIG.api_url}/items`;

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
    const requestOptions = new RequestOptions();
    const params = new URLSearchParams();
    params.set(field, term);
    requestOptions.params = params;
    return this.http.get(this.transactionUrl, requestOptions)
      .map(res => res.json() as Transaction[]);
  }

  customerSearch(term: string): Observable<Customer[]> {
    const params = new URLSearchParams();
    const requestOptions = new RequestOptions();
    params.set('q', '"' + term + '"');
    requestOptions.params = params;
    return this.http.get(this.customerUrl, requestOptions)
      .map(res => res.json() as Customer[]);
  }

  repairSearch(term: string): Observable<RepairItem[]> {
    const params = new URLSearchParams();
    const requestOptions = new RequestOptions();
    params.set('q', term);
    requestOptions.params = params;
    requestOptions.headers = this.jwt_headers();
    return this.http.get(this.repairUrl, requestOptions)
      .map(res => res.json() as RepairItem[]);
  }

  /**
   * Searches for item by given parameters, returns an observable of results
   * @param name: name of item
   * @param upc: item's universal product code
   * @param category: item category
   * @param brand: item brand
   * @param condition: item condition (New or Used)
   */
  itemSearch(name?: string,
             upc?: number,
             category?: string,
             brand?: string,
             condition?: string): Observable<Item[]> {
    const params = new URLSearchParams();
    const requestOptions = new RequestOptions();
    if (name) {params.set('name', name); }
    if (upc) {params.set('upc', String(upc)); }
    if (category) {params.set('category', category); }
    if (brand) {params.set('brand', brand); }
    if (condition) {params.set('condition', condition); }
    requestOptions.params = params;
    return this.http.get(`${this.itemUrl}/search`, requestOptions)
      .map(res => res.json() as Item[]);
  }

  /**
   * Gets distinct item categories
   */
  itemCategories(): Promise<String[]> {
    return this.http.get(`${this.itemUrl}/categories`)
      .toPromise()
      .then(res => res.json())
      .catch(err => console.log(err));
  }

  /**
   * Gets distinct item brands known to database
   */
  itemBrands(): Promise<String[]> {
    return this.http.get(`${this.itemUrl}/brands`)
      .toPromise()
      .then(res => res.json())
      .catch(err => console.log(err));
  }
}

