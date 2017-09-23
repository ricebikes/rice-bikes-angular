import {Injectable, OnInit} from '@angular/core';
import { Http } from "@angular/http";
import {Subject} from "rxjs";

@Injectable()
export class AuthenticationService implements OnInit {

  private authUrl: string = 'http://localhost:3000/users/authenticate';

  private loggedIn: Subject<boolean> = new Subject<boolean>();

  constructor(private http: Http) {}

  ngOnInit() {
    if (localStorage.getItem('currentUser')) {
      this.loggedIn.next(true);
    } else {
      this.loggedIn.next(false);
    }
  }

  get isLoggedIn() {
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
  }

  public logout(): Promise<any> {
    return new Promise((resolve, reject) => {
      localStorage.removeItem('currentUser');
      this.loggedIn.next(false);
      return resolve("Logged out");
    });
  }
}
