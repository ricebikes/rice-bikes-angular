import { Injectable } from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpHeaders} from '@angular/common/http';
import {CONFIG} from '../config';
import {Observable} from 'rxjs/Observable';
import {AlertService} from './alert.service';
import {catchError, retry} from 'rxjs/operators';
import {collectExternalReferences} from '@angular/compiler';

@Injectable()
export class AdminService {

  constructor(private http: HttpClient, private  alertService: AlertService) {}


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

  private jwt() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser.token) {
      return {
        headers: new HttpHeaders(
          { 'x-access-token': currentUser.token }
          )
      };
    }else {
      return null;
    }
  }

  getUsers(): Observable<any> {
    return this.http.get(`${CONFIG.api_url}/users`, this.jwt()).pipe(
      retry(2),
      catchError((err) => {
        return this.handleError(err);
      })
    );
  }

  postUser(username: String, roles: Array<string>): Observable<any> {
    return this.http.post(`${CONFIG.api_url}/users`,
      {
        username: username,
        roles: roles
      },
      this.jwt()).pipe(
        retry(2),
      catchError((err) => {
        return this.handleError(err);
      })
    );
  }

  deleteUser(user_id: String) {
    return this.http.delete(`${CONFIG.api_url}/users/${user_id}`, this.jwt()).pipe(
      retry(2),
      catchError((err) => {
        return this.handleError(err);
      })
    );
  }

}
