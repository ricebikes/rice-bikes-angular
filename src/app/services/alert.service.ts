import { Injectable } from '@angular/core';
import { Router, NavigationStart } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { Alert } from '../models/alert';
import { environment } from '../../environments/environment';

@Injectable()
export class AlertService {
  private alertSubject = new Subject<Alert>();
  // if true, hold alert for one navigation change
  private keepAfterNavigationChange = false;

  /**
   * Debug log, only runs when the code isn't in production
   * @param msg
   */
  static debugLog(msg: any) {
    if (!environment.production) {
      console.log('DEBUG ' + new Date() + ': ' + JSON.stringify(msg));
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

  /**
   * Send a success message to user
   * @param title: title of message
   * @param message: message content
   * @param code: success code (usually 0)
   * @param keepAfterNavigationChange: keep the message for one navigation change
   */
  success(title: string, message: string, code: number, keepAfterNavigationChange = false) {
    this.keepAfterNavigationChange = keepAfterNavigationChange;
    this.alertSubject.next({ title: title, code: code, message: message, type: 'success' });
  }

  /**
   * Send an error message to user
   * @param title: title of message
   * @param message: message content
   * @param code: error code (usually HTTP error code)
   * @param keepAfterNavigationChange: keep the message for one navigation change
   */
  error(title: string, message: string, code: number, keepAfterNavigationChange = false) {
    this.keepAfterNavigationChange = keepAfterNavigationChange;
    console.log('ERROR ' + new Date() + ' ' + message);
    this.alertSubject.next({ title: title, code: code, message: message, type: 'error' });
  }

  getMessage(): Observable<Alert> {
    return this.alertSubject.asObservable();
  }
}
