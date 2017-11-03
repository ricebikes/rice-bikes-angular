import { Injectable } from '@angular/core';
import {Headers, Http, RequestOptions} from "@angular/http";
import {CONFIG} from "../config";

@Injectable()
export class AdminService {

  constructor(private http: Http) {}

  private jwt() {
    let currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser && currentUser.user.token) {
      let headers = new Headers({ 'x-access-token': currentUser.user.token });
      return new RequestOptions({ headers: headers });
    }
  }

  getUsers(): Promise<any> {
    return this.http.get(`${CONFIG.api_url}/users`, this.jwt())
      .toPromise()
      .then(res => res.json())
      .catch(err => console.log(err));
  }

  postUser(username: String, admin: boolean): Promise<any> {
    return this.http.post(`${CONFIG.api_url}/users`, { username: username, admin: admin }, this.jwt())
      .toPromise()
      .then(res => res.json())
      .catch(err => console.log(err));
  }

  deleteUser(user_id: String) {
    return this.http.delete(`${CONFIG.api_url}/users/${user_id}`, this.jwt())
      .toPromise()
      .catch(err => console.log(err));
  }

}
