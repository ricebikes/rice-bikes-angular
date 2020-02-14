import { Component, OnInit } from '@angular/core';
import {AnalyticsService} from '../../services/analytics.service';
import {FormBuilder, Validators} from '@angular/forms';

@Component({
  selector: 'app-analytics',
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.css']
})
export class AnalyticsComponent implements OnInit {

  platformSupported = this.analyticsService.checkSupport();
  transactionDatesValid = true;
  employeeDatesValid = true;

  dateFormTransaction = this.formBuilder.group({
    startDate: ['', Validators.required],
    endDate: ['', Validators.required]
  });

  dateFormEmployees = this.formBuilder.group({
    startDate: ['', Validators.required],
    endDate: ['', Validators.required]
  });
  constructor(private analyticsService: AnalyticsService, private formBuilder: FormBuilder) { }

  ngOnInit() {
    // subscribe to form changes, and invalidate the form if the start date is after the end date
    this.dateFormTransaction.valueChanges.subscribe(formData => {
      if (new Date(formData.startDate) > new Date(formData.endDate)) {
          this.transactionDatesValid = false;
          // this invalidates the form
          this.dateFormTransaction.controls['startDate'].setErrors({'incorrect': true});
        } else {
          this.transactionDatesValid = true;
          // restores form to normal validation
          this.dateFormTransaction.controls['startDate'].setErrors(null);
        }
    });

    this.dateFormEmployees.valueChanges.subscribe(formData => {
      if (new Date(formData.startDate) > new Date(formData.endDate)) {
        this.employeeDatesValid = false;
        // this invalidates the form
        this.dateFormEmployees.controls['startDate'].setErrors({'incorrect': true});
      } else {
        this.employeeDatesValid = true;
        // restores form to normal validation
        this.dateFormEmployees.controls['startDate'].setErrors(null);
      }
    });
  }

  employeeFormSubmit() {
    const start = new Date(this.dateFormEmployees.get('startDate').value);
    const end = new Date(this.dateFormEmployees.get('endDate').value);
    this.analyticsService.getAllEmployeeMetrics(start, end).then(res => this.dateFormEmployees.reset());
  }

  transactionFormSubmit() {
    const start = new Date(this.dateFormTransaction.get('startDate').value);
    const end = new Date(this.dateFormTransaction.get('endDate').value);
    this.analyticsService.getTransactionData(start, end).then(res => this.dateFormTransaction.reset());
  }
}
