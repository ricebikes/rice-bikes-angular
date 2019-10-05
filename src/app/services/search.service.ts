import { Injectable } from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpHeaders, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs/Observable';
import {CONFIG} from '../config';
import {catchError, retry} from 'rxjs/operators';
import {AlertService} from './alert.service';

@Injectable()
export class SearchService {

  private transactionUrl = `${CONFIG.api_url}/transactions/search`;
  private customerUrl = `${CONFIG.api_url}/customers/search`;
  private repairUrl = `${CONFIG.api_url}/repairs/search`;
  private itemUrl = `${CONFIG.api_url}/items`;
  private userUrl = `${CONFIG.api_url}/users`;

  constructor(private http: HttpClient, private  alertService: AlertService) {}


  private jwt_headers() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser.token) {
      const headers = new HttpHeaders({'x-access-token': currentUser.token});
      return headers;
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
        `Message was: ${error.message}`
      );
    }
    return Observable.throw(error);
  }


  /**
   * Searches for transactions, looking in the given field for the given term.
   * @param field - one of {bike, customer, description}
   * @param term - term to search for
   * @returns {Observable<R>}
   */
  transactionSearch(field: string, term: string): Observable<any> {
    const requestOptions = {
      params: new HttpParams().set(field, term)
    };
    return this.http.get(this.transactionUrl, requestOptions)
      .pipe(
        retry(2),
        catchError((err) => {
        return this.handleError(err);
      })
      );
  }

  customerSearch(term: string): Observable<any> {
    const requestOptions = {
      params: new HttpParams().set('q', '"' + term + '"')
    };
    return this.http.get(this.customerUrl, requestOptions)
      .pipe(
      retry(2),
      catchError((err) => {
        return this.handleError(err);
      })
    );
  }

  repairSearch(term: string): Observable<any> {
    const requestOptions = {
      headers: this.jwt_headers(),
      params: new HttpParams().set('q', term)
    };
    return this.http.get(this.repairUrl, requestOptions)
      .pipe(
        retry(2),
        catchError((err) => {
        return this.handleError(err);
      })
      );
  }

// Item search functionality: requires additional functions to populate category and sizes in the search pand
// using optional parameters here so that we can search by just name for an item (if a value is null the backend discards it)
  itemSearch(name: string, category?: string, size?: string): Observable<any> {
    const params = new HttpParams();
    params.set('category', category);
    params.set('size', size);
    params.set('name', name);
    const requestOptions = {
      headers: this.jwt_headers(),
      params: params
  };
    return this.http.get(`${this.itemUrl}/search`, requestOptions)
      .pipe(
        retry(2),
        catchError((err) => {
        return this.handleError(err);
      })
      );
  }

  itemCategories(): Observable<any> {
    return this.http.get(`${this.itemUrl}/categories`)
      .pipe(
        retry(2),
        catchError((err) => {
        return this.handleError(err);
      })
      );
  }

  itemSizes(category: string): Observable<any> {
    const params = new HttpParams();
    params.set('category', category);
    const requestOptions = {
      headers: this.jwt_headers(),
      params: params
  };
    return this.http.get(`${this.itemUrl}/sizes`, requestOptions)
      .pipe(
        retry(2),
        catchError((err) => {
        return this.handleError(err);
      })
      );
  }

  userSearch(netID: string):Observable<any> {
    const params = new HttpParams();
    params.set('netid',netID);
    const requestOptions = {
      headers: this.jwt_headers(),
      params: params
    };
    return this.http.get(`${this.userUrl}/search`, requestOptions)
      .pipe(
        retry(2),
        catchError( (err) => {
          return this.handleError(err);
        })
      )
  }
}

