import { Injectable } from '@angular/core';
import {CONFIG} from '../config';
import {HttpClient, HttpErrorResponse, HttpHeaders} from '@angular/common/http';
import {AlertService} from './alert.service';
import {catchError, retry} from 'rxjs/operators';
import {Observable} from 'rxjs/Observable';

@Injectable()
export class RepairService {

  private backendURL = `${CONFIG.api_url}/repairs`;


  constructor(private http: HttpClient, private alertService: AlertService) {
  }

  private jwt() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser.token) {
      const headers = new HttpHeaders({'x-access-token': currentUser.token});
      return {headers: headers};
    }
  }

  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      // client side or network error
      this.alertService.queueAlert(`An error occurred: ${error.error.message}`);
    } else {
      // backed encountered an error
      this.alertService.queueAlert(
        `Backend returned error code ${error.status}` +
        ` body was :${error.error}`
      );
    }
    return Observable.throw(error);
  }

  /**
   * Gets all repairs from backend
   */
 getRepairs(): Observable<any> {
    return this.http.get(this.backendURL, this.jwt())
      .pipe(
        retry(2),
        catchError((err) => {
        return this.handleError(err);
      })
      );
 }

  /**
   * Adds a repair to the backend
   */
  postRepair(name: String, price: Number, description: String): Observable<any> {
    return this.http.post(this.backendURL, {name: name, price: price, description: description}, this.jwt())
      .pipe(
        retry(2),
        catchError((err) => {
        return this.handleError(err);
      })
      );
  }

  // updates a repair
  putRepair(id: String, name: String, price: Number, description: String): Observable<any> {
    return this.http.put(`${this.backendURL}/${id}`, {id: id, name: name, price: price, description: description}, this.jwt())
      .pipe(
        retry(2),
        catchError((err) => {
        return this.handleError(err);
      })
      );
  }

  deleteRepair(id: String): Observable<any> {
    return this.http.delete(`${this.backendURL}/${id}`, this.jwt())
      .pipe(
        retry(2),
        catchError((err) => {
        return this.handleError(err);
      })
      );
  }
}
