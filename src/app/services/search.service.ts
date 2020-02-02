import { Injectable } from '@angular/core';
import {Http, URLSearchParams, RequestOptions, Headers} from '@angular/http';
import {Customer} from '../models/customer';
import {RepairItem} from '../models/repairItem';
import {Item} from '../models/item';
import {Transaction} from '../models/transaction';
import {CONFIG} from '../config';
import {Observable} from 'rxjs/Observable';
import {Repair} from '../models/repair';

@Injectable()
export class SearchService {

  private transactionUrl = `${CONFIG.api_url}/transactions/search`;
  private customerUrl = `${CONFIG.api_url}/customers/search`;
  private repairUrl = `${CONFIG.api_url}/repairs/search`;
  private itemUrl = `${CONFIG.api_url}/items`;

  constructor(private http: Http) {}


  private static jwt_headers() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser.token) {
      return new Headers({'x-access-token': currentUser.token});
    }
  }
  /**
   * Searches for transactions, looking in the given field for the given term.
   * @param field - one of {bike, customer, description}
   * @param term - term to search for
   * @returns {Observable}
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

  repairSearch(term: string): Observable<Repair[]> {
    const params = new URLSearchParams();
    const requestOptions = new RequestOptions();
    params.set('q', term);
    requestOptions.params = params;
    requestOptions.headers = SearchService.jwt_headers();
    return this.http.get(this.repairUrl, requestOptions)
      .map(res => res.json() as Repair[]);
  }

  /**
   * Searches for item by given parameters, returns an observable of results
   * @param name: name of item
   * @param category: item category
   * @param size: item size
   * @param brand: item brand
   * @param condition: item condition (New or Used)
   */
  itemSearch(name?: string,
             category?: string,
             size?: string,
             brand?: string,
             condition?: string): Promise<Item[]> {
    const params = new URLSearchParams();
    const requestOptions = new RequestOptions();
    requestOptions.headers = SearchService.jwt_headers();
    if (name) {params.set('name', name); }
    if (category) {params.set('category', category); }
    if (size) {params.set('size', size); }
    if (brand) {params.set('brand', brand); }
    if (condition) {params.set('condition', condition); }
    if (!(name || category || size || brand || condition)) {return Observable.of([]).toPromise(); }
    requestOptions.params = params;
    return this.http.get(`${this.itemUrl}/search`, requestOptions)
      .toPromise()
      .then(res => res.json() as Item[]);
  }

  /**
   * Searches for an item by the UPC only. Its expected that there will only be one item returned here.
   * @param upc
   */
  upcSearch(upc: string): Promise<Item[]> {
    const params = new URLSearchParams();
    const requestOptions = new RequestOptions();
    requestOptions.headers = SearchService.jwt_headers();
    params.set('upc', upc);
    requestOptions.params = params;
    return this.http.get(`${this.itemUrl}/search`, requestOptions)
      .toPromise()
      .then(res => res.json() as Item[]);
  }

  /**
   * Gets distinct item categories
   */
  itemCategories(): Promise<String[]> {
    return this.http.get(`${this.itemUrl}/categories`,
      new RequestOptions({headers: SearchService.jwt_headers()}))
      .toPromise()
      .then(res => res.json().sort())
      .catch(err => console.log(err));
  }

  /**
   * Gets distinct item brands known to database
   */
  itemBrands(): Promise<String[]> {
    return this.http.get(`${this.itemUrl}/brands`,
      new RequestOptions({headers: SearchService.jwt_headers()}))
      .toPromise()
      .then(res => res.json().sort())
      .catch(err => console.log(err));
  }

  /**
   * Gets distinct item sizes given a specific category
   * @param category: Item category to search with
   */
  itemSizes(category: string): Promise<String[]> {
    const params = new URLSearchParams();
    const requestOptions = new RequestOptions();
    requestOptions.headers = SearchService.jwt_headers();
    params.set('category', category);
    requestOptions.params = params;
    return this.http.get(`${this.itemUrl}/sizes`, requestOptions)
      .toPromise()
      .then(res => res.json().sort())
      .catch(err => console.log(err));
  }
}

