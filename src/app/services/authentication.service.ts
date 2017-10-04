import {Injectable, OnInit} from '@angular/core';
import { Http } from "@angular/http";
import {Subject, BehaviorSubject} from "rxjs";
import {AlertService} from "./alert.service";

@Injectable()
export class AuthenticationService implements OnInit {

  private authUrl: string = 'http://localhost:3000/users/authenticate';

  public loggedIn: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(private http: Http, private alertService: AlertService) {}

  ngOnInit() {
    if (localStorage.getItem('currentUser')) {
      this.loggedIn.next(true);
    } else {
      this.loggedIn.next(false);
    }
  }

  get isLoggedIn() {
    if (localStorage.getItem('currentUser')) {
      this.loggedIn.next(true);
    } else {
      this.loggedIn.next(false);
    }
    return this.loggedIn.asObservable();
  }

  public login(username: string, password: string): Promise<any> {
    return this.http.post(this.authUrl, {username: username, password: password})
      .toPromise()
      .then(res => {
        let user = res.json();
        if (user && user.token) {
          localStorage.setItem('currentUser', JSON.stringify(user));
          this.loggedIn.next(true);
        }
      })
      .catch(err => this.alertService.error("Incorrect username and/or password", false))
  }

  public logout(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.alertService.success("Bye bye!");
      localStorage.removeItem('currentUser');
      this.loggedIn.next(false);
      return resolve("Logged out");
    });

  }

}
