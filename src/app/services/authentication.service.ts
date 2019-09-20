import {Injectable, OnInit} from '@angular/core';
import {Headers, Http, RequestOptions} from '@angular/http';
import {Subject, BehaviorSubject} from 'rxjs';
import {AlertService} from './alert.service';
import {CONFIG} from '../config';
import * as jwt from 'jsonwebtoken';
import {User} from '../models/user';
import {AdminService} from './admin.service';

@Injectable()
export class AuthenticationService implements OnInit {

  public loggedIn: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public admin: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public projects: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  private _currentUser: User;

  constructor(private http: Http, private alertService: AlertService, private userManager: AdminService) {
  }

  ngOnInit() {
    if (localStorage.getItem('currentUser')) {
      this.loggedIn.next(true);
    } else {
      this.loggedIn.next(false);
    }
  }

  public login(x, y): Promise<any> {
    return null;
  }

  public authenticate(ticket: String): Promise<any> {
    return this.http.get(`${CONFIG.api_url}/auth?ticket=${ticket}`)
      .toPromise()
      .then(res => {
        const result = res.json();
        if (result && result.success) {
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
      this.alertService.success('Bye bye!');
      localStorage.removeItem('currentUser');
      this.loggedIn.next(false);
      this.admin.next(false);
      return resolve('Logged out');
    });
  }

  /**
   * Sets new stored user
   * @param updatedUser: new user to set
   */
  setUser(updatedUser: User) {
    this._currentUser = updatedUser;
  }

  /**
   * Gets the current stored user
   */
  getUser(): User {
    return this._currentUser;
  }

  /**
   * Gets list of current users registered with application
   */
  userList(): Promise<any> {
    return this.userManager.getUsers();
  }
  /**
   * Returns user credentials for backend, formed as headers to add to the HTTP request.
   */
  public getCredentials(): RequestOptions {
    this.userList().then(res => this.setUser(res[0]));
      const currentUser = JSON.parse(localStorage.getItem('currentUser'));
      if (currentUser.token) {
        if (this._currentUser) {
          const headers = new Headers({ 'x-access-token': currentUser.token,
            'user-id' : this.getUser()._id});
          return new RequestOptions({ headers: headers });
        }
        const headers = new Headers({ 'x-access-token': currentUser.token});
        return new RequestOptions({ headers: headers });
      }
  }

}
