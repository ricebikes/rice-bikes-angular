import {Injectable, OnInit} from '@angular/core';
import { Http } from "@angular/http";
import {Subject, BehaviorSubject} from "rxjs";
import {AlertService} from "./alert.service";
import {CONFIG} from "../config";

@Injectable()
export class AuthenticationService implements OnInit {

  public loggedIn: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public admin: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(private http: Http, private alertService: AlertService) {}

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
        let result = res.json();
        if (result && result.success) {
          localStorage.setItem('currentUser', JSON.stringify(result));

          this.loggedIn.next(true);
          this.admin.next(result.user.admin);

        } else {
          console.log("Authentication failed")
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
    let userData = JSON.parse(localStorage.getItem('currentUser'));
    if (userData && userData.user.admin) {
      this.admin.next(true);
    } else {
      this.admin.next(false);
    }
    return this.admin.asObservable();
  }

  public logout(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.alertService.success("Bye bye!");
      localStorage.removeItem('currentUser');
      this.loggedIn.next(false);
      this.admin.next(false);
      return resolve("Logged out");
    });

  }

}
