import {Injectable, OnInit} from '@angular/core';
import {Headers, Http, RequestOptions} from '@angular/http';
import {Subject, BehaviorSubject} from 'rxjs';
import {AlertService} from './alert.service';
import {CONFIG, user_timeout} from '../config';
import * as jwt from 'jsonwebtoken';
import {User} from '../models/user';
import {AdminService} from './admin.service';
import {Observable} from 'rxjs/Observable';
import {UserIdleService} from 'angular-user-idle/user-idle.service';

// export second class to track user state
export class UserState {
  user: User;
  state: String;
  timeout: Number;
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
    state: 'timeout',
    // -1 is timeouts "unset" state -- once timeout becomes a positive values we can assume inactivity timer has started
    timeout: -1
  });

  private _currentUser: User;

  constructor(private http: Http, private alertService: AlertService,
              private userManager: AdminService, private userIdle: UserIdleService) {
    this.ngOnInit();
  }

  ngOnInit() {
    if (localStorage.getItem('currentUser')) {
      this.loggedIn.next(true);
    } else {
      this.loggedIn.next(false);
    }
    // if we have a set user, reload it from the local storage
    if (localStorage.getItem('accountabilityUser')) {
      const accountabilityUser = JSON.parse(localStorage.getItem('accountabilityUser'));
      console.log('Found user in storage');
      this.userTrackerSource.next({
        user: accountabilityUser,
        state: 'set',
        timeout: -1
      });
    }
    console.log('Starting watch');
    this.userIdle.startWatching();
    this.userIdle.onTimerStart().subscribe(count => {
        if (count < user_timeout) {
          this.userTrackerSource.next({
            // set the count to a positive value so subscribers know timeout is imminent
            user: this.userTrackerSource.value.user,
            state: 'set',
            timeout: count,
          });
        }
      }
    );
    this.userIdle.onTimeout().subscribe(() => {
      // timeout has been reached. Clear user from store
      console.log('Timeout!');
      this.userTrackerSource.next({
        user: null,
        state: 'timeout',
        timeout: -1
      });
      localStorage.removeItem('accountabilityUser');
    });
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

  public resetTimer() {
    this.userIdle.resetTimer();
    this.userTrackerSource.next({
      user: this.userTrackerSource.value.user,
      state: 'set',
      timeout: -1
    });
  }

  /**
   * Sets new stored user. Should be called by provider of new users.
   * @param updatedUser: new user to set
   */
  setUser(updatedUser: User) {
    // set the next user in the tracker source
    console.log('Setting User');
    this.userIdle.resetTimer();
    this.userTrackerSource.next({
      user: updatedUser,
      // tells listeners the user tracker is set and no action is needed
      state: 'set',
      timeout: -1
    });
    // set current user into local store as well
    localStorage.setItem('accountabilityUser', JSON.stringify(updatedUser));
    // this will tell any listeners waiting on a user to be selected that the user is ready.
    this.userEmitter.next(updatedUser);
  }

  /**
   * Gets the user tracker source as an observable. This is the only way outside components may view values.
   */
  getUser(): Observable<UserState> {
    if (localStorage.getItem('accountabilityUser')) {
      const accountabilityUser = JSON.parse(localStorage.getItem('accountabilityUser'));
      console.log('Found user in storage');
      this.userTrackerSource.next({
        user: accountabilityUser,
        state: 'set',
        timeout: -1
      });
    }
    return this.userTrackerSource.asObservable();
  }

  /**
   * Gets list of current users registered with application
   */
  userList(): Promise<User[]> {
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
          this.userTrackerSource.next({user: null, state: 'waiting', timeout: -1});
        } else {
          this.userEmitter.next(this.userTrackerSource.getValue().user);
        }
      } else {

      }
    });
  }
}
