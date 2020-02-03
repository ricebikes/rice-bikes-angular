import { Component, OnInit } from '@angular/core';
import {AlertService} from '../../services/alert.service';
import {Alert} from '../../models/alert';
import {Observable} from 'rxjs/Observable';

@Component({
  selector: 'app-alert',
  templateUrl: 'alert.component.html',
  styleUrls: ['alert.component.css']
})
export class AlertComponent implements OnInit {
  currentAlert: Observable<Alert>;

  constructor(private alertService: AlertService) { }

  ngOnInit() {
    this.currentAlert = this.alertService.getMessage();
  }
}

