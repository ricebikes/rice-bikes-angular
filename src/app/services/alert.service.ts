import { Injectable } from '@angular/core';
import { Router, NavigationStart } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import {Alert} from '../models/alert';
import {environment} from '../../environments/environment';

@Injectable()
export class AlertService {
  private alertSubject = new Subject<Alert>();
  // if true, hold alert for one navigation change
  private keepAfterNavigationChange = false;

  static debugLog(msg) {
    if (!environment.production) {
      console.log('DEBUG ' + new Date() + ' ' + msg);
    }
  }

  constructor(private router: Router) {
    // clear alert message on route change
    router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        if (this.keepAfterNavigationChange) {
          // only keep for a single location change
          this.keepAfterNavigationChange = false;
        } else {
          // clear alert
          this.alertSubject.next();
        }
      }
    });
  }

  success(title: string, message: string, code: number, keepAfterNavigationChange = false) {
    this.keepAfterNavigationChange = keepAfterNavigationChange;
    this.alertSubject.next({title: title, code: code, message: message, type: 'success'});
  }

  error(title: string, message: string, code: number, keepAfterNavigationChange = false) {
    this.keepAfterNavigationChange = keepAfterNavigationChange;
    console.log('ERROR ' + new Date() + ' ' + message);
    this.alertSubject.next({title: title, code: code, message: message, type: 'error'});
  }

  getMessage(): Observable<Alert> {
    return this.alertSubject.asObservable();
  }
}
