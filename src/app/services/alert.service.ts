import { Injectable } from '@angular/core';
import {Observable} from 'rxjs/Observable';

// simple class to track alerts and allow frontend to display them

@Injectable()
export class AlertService {
  private AlertQueue: String[] = [];
  constructor () {}

  subscribeToAlerts(): Observable<String[]> {
    return Observable.of(this.AlertQueue);
  }

  queueAlert(alert: String) {
    this.AlertQueue.push(alert);
  }
}
