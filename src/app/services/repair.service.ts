import { Injectable } from '@angular/core';
import {CONFIG} from '../config';
import {Http, Headers, RequestOptions} from '@angular/http';
import {AlertService} from './alert.service';

@Injectable()
export class RepairService {

  private backendURL = `${CONFIG.api_url}/repairs`;


  constructor(private http: Http, private alertService: AlertService) {
  }

  private jwt() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser.token) {
      const headers = new Headers({'x-access-token': currentUser.token});
      return new RequestOptions({headers: headers});
    }
  }

  private handleError(err): void {
    if (err.status == 401) {
      this.alertService.error('Looks like you aren\'t allowed to do that :(', false);
    }
  }

  /**
   * Gets all repairs from backend
   */
 getRepairs(): Promise<any> {
    return this.http.get(this.backendURL, this.jwt())
      .toPromise()
      .then(res => res.json())
      .catch(err => this.handleError(err));
 }

  /**
   * Adds a repair to the backend
   */
  postRepair(name: String, price: Number, description: String): Promise<any> {
    return this.http.post(this.backendURL, {name: name, price: price, description: description}, this.jwt())
      .toPromise()
      .then(res => res.json())
      .catch(err => this.handleError(err));
  }

  // updates a repair
  putRepair(id: String, name: String, price: Number, description: String) {
    return this.http.put(`${this.backendURL}/${id}`, {id: id, name: name, price: price, description: description}, this.jwt())
      .toPromise()
      .then(res => res.json())
      .catch(err => this.handleError(err));
  }

  deleteRepair(id: String): Promise<any> {
    return this.http.delete(`${this.backendURL}/${id}`, this.jwt())
      .toPromise()
      .catch(err => this.handleError(err));
  }
}
