import { Injectable } from '@angular/core';
import { Headers, Http, RequestOptions } from '@angular/http';
import { CONFIG } from '../config';
import { HttpErrorResponse } from '@angular/common/http';
import { AlertService } from './alert.service';
import { User } from '../models/user';

@Injectable()
export class AdminService {

  constructor(private http: Http, private alertService: AlertService) { }

  private static jwt() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser.token) {
      const headers = new Headers({ 'x-access-token': currentUser.token });
      return new RequestOptions({ headers: headers });
    }
  }

  private handleError(err: HttpErrorResponse): void {
    let message = err.message;
    if (!message) {
      message = JSON.stringify(err);
    }
    this.alertService.error(err.statusText, message, err.status);
  }

  getUsers(): Promise<any> {
    return this.http.get(`${CONFIG.api_url}/users`, AdminService.jwt())
      .toPromise()
      .then(res => res.json())
      .catch(err => this.handleError(err));
  }

  createUser(firstName: String, lastName: String, username: String, roles: Array<string>): Promise<any> {
    return this.http.post(`${CONFIG.api_url}/users`,
      { firstName: firstName, lastName: lastName, username: username, roles: roles }, AdminService.jwt())
      .toPromise()
      .then(res => res.json())
      .catch(err => this.handleError(err));
  }

  updateUser(user: User, firstName: String, lastName: String, username: String, roles: Array<string>, active: Boolean) {
    return this.http.put(`${CONFIG.api_url}/users/${user._id}`,
      { firstName: firstName, lastName: lastName, username: username, roles: roles, active }, AdminService.jwt())
      .toPromise()
      .then(res => res.json() as User)
      .catch(err => this.handleError(err));
  }

  deleteUser(user_id: String) {
    return this.http.delete(`${CONFIG.api_url}/users/${user_id}`, AdminService.jwt())
      .toPromise()
      .catch(err => this.handleError(err));
  }

}
