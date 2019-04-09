import {Injectable, OnInit} from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {Subject, BehaviorSubject} from "rxjs";
import {AlertService} from "./alert.service";
import {CONFIG} from "../config";
import * as jwt from 'jsonwebtoken';
import {Observable} from 'rxjs/Observable';

@Injectable()
export class AuthenticationService implements OnInit {

  public loggedIn: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public admin: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public projects: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient, private alertService: AlertService) {}

  ngOnInit() {
    if (localStorage.getItem('currentUser')) {
      this.loggedIn.next(true);
    } else {
      this.loggedIn.next(false);
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
  public login(x, y): Promise<any> {
    return null;
  }

  public authenticate(ticket: String): Promise<any> {
    return this.http.get(`${CONFIG.api_url}/auth?ticket=${ticket}`)
      .toPromise()
      .then(result => {
        if (result && result['success']) {
          localStorage.setItem('currentUser', JSON.stringify(result));
          this.loggedIn.next(true);
          this.admin.next((this.checkForRole('admin')));
          this.projects.next((this.checkForRole('projects')));
        } else {
          console.log('Authentication failed');
        }
      })
      .catch(err => console.log(err));
  }

  get isLoggedIn() {
    if (localStorage.getItem('currentUser')) {
      this.loggedIn.next(true);
    } else {
      this.loggedIn.next(false);
    }
    return this.loggedIn.asObservable();
  }

  get isAdmin() {
    this.admin.next(this.checkForRole('admin'));
    return this.admin.asObservable();
  }

  get isProjects(){
    this.projects.next(this.checkForRole('projects'));
    return this.projects.asObservable();
  }
  /*
  Checks for a role in the user token
  @param role: user role to check for
   */
  private checkForRole(role: String): boolean {
    const current_user = JSON.parse((localStorage.getItem('currentUser')));
    if (current_user) {
      const token = current_user.token;
      const decoded = jwt.decode(token);
      if (decoded) {
        const user_roles = decoded.user.roles;
        return user_roles.includes(role);
      }else {
        return false;
      }
    }
  }

  public logout(): Promise<any> {
    return new Promise((resolve, reject) => {
      localStorage.removeItem('currentUser');
      this.loggedIn.next(false);
      this.admin.next(false);
      return resolve("Logged out");
    });

  }

}
