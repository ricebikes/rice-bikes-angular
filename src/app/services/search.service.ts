import { Injectable } from '@angular/core';
import {Http, URLSearchParams, RequestOptions, Headers} from '@angular/http';
import {Observable} from 'rxjs';
import {Customer} from '../models/customer';
import {RepairItem} from '../models/repairItem';
import {Item} from '../models/item';
import {Transaction} from '../models/transaction';
import {CONFIG} from '../config';

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

// Item search functionality: requires additional functions to populate category and sizes in the search pand
// using optional parameters here so that we can search by just name for an item
  itemSearch(name: string, category?: string, size?: string): Observable<Item[]> {
    // default values for the category and size allow search to still work with just a name
    const params = new URLSearchParams();
    const requestOptions = new RequestOptions();
    params.set('category', category);
    params.set('size', size);
    params.set('name', name);
    requestOptions.params = params;
    return this.http.get(`${this.itemUrl}/search`, requestOptions)
      .map(res => res.json() as Item[]);
  }

  itemCategories(): Promise<String[]> {
    return this.http.get(`${this.itemUrl}/categories`)
      .toPromise()
      .then(res => res.json())
      .catch(err => console.log(err));
  }

  itemSizes(category: string): Promise<String[]> {
    const params = new URLSearchParams();
    const requestOptions = new RequestOptions();
    params.set('category', category);
    requestOptions.params = params;
    return this.http.get(`${this.itemUrl}/sizes`, requestOptions)
      .toPromise()
      .then(res => res.json())
      .catch(err => console.log(err));
  }
}

