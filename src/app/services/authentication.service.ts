import {Injectable, OnInit} from '@angular/core';
import {Headers, Http, RequestOptions} from '@angular/http';
import {Subject, BehaviorSubject} from 'rxjs';
import {AlertService} from './alert.service';
import {CONFIG} from '../config';
import * as jwt from 'jsonwebtoken';
import {User} from '../models/user';
import {AdminService} from './admin.service';
import {Observable} from 'rxjs/Observable';

// export second class to track user state
export class UserState {
  user: User;
  state: String;
}


@Injectable()
export class AuthenticationService implements OnInit {

  public loggedIn: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public admin: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public projects: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  // subject that handles emitting new values for the user ID.
  private userEmitter = new Subject<User>();

  // subject that tracks communication with the user tracker
  private userTrackerSource = new BehaviorSubject<UserState>({
    user: null,
    // tells subscribers that the user login has timed out, but no action is required.
    state: 'timeout'
  });

  private _currentUser: User;

  constructor(private http: Http, private alertService: AlertService, private userManager: AdminService) {}

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
   * Sets new stored user. Should be called by provider of new users.
   * @param updatedUser: new user to set
   */
  setUser(updatedUser: User) {
    // set the next user in the tracker source
    console.log('Setting User');
    this.userTrackerSource.next({
      user: updatedUser,
      // tells listeners the user tracker is set and no action is needed
      state: 'set'
    });
    // this will tell any listeners waiting on a user to be selected that the user is ready.
    this.userEmitter.next(updatedUser);
  }

  /**
   * Gets the user tracker source as an observable. This is the only way outside components may view values.
   */
  getUser(): Observable<UserState> {
    return this.userTrackerSource.asObservable();
  }

  /**
   * Gets list of current users registered with application
   */
  userList(): Promise<any> {
    return this.userManager.getUsers();
  }
  /**
   * Returns user credentials for backend, formed as headers to add to the HTTP request.
   * Does not include user ID. Use when action tracking is not required, only JWT
   */

  public getCredentials(): Promise<RequestOptions> {
    // return a promise. Promise will resolve if we have a logged in user
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    return new Promise<RequestOptions>((resolve, reject) => {
      if (currentUser.token) {
        const headers = new Headers({'x-access-token': currentUser.token});
        resolve(new RequestOptions({headers: headers}));
      }
      // failed to get token. Reject the request.
      reject();
    });
  }

  /**
   * Returns user credentials with the current user as the user-id header. Will prompt
   * User to give their name if current user login has timed out.
   */
  public getUserCredentials(): Promise<RequestOptions> {
    // resolve promise once we have a user to return. If none exists, emit an event so that we can ask for one.
    return new Promise<RequestOptions>((resolve, reject) => {
      const currentUser = JSON.parse(localStorage.getItem('currentUser'));
      if (currentUser.token) {
        // async block. Will execute once a value is emitted for the current user
        this.userEmitter.subscribe((nextUser) => {
          console.log('Got a user');
          const headers = new Headers({'x-access-token': currentUser.token,
            'user-id': nextUser._id});
          resolve(new RequestOptions({headers: headers}));
        });
        if (this.userTrackerSource.value.state === 'timeout') {
          console.log('Waiting for user');
          // emit a new state. This will trigger user tracker to get another user.
          this.userTrackerSource.next({user: null, state: 'waiting'});
        } else {
          this.userEmitter.next(this.userTrackerSource.getValue().user);
        }
      } else {

      }
    });
  }
}
