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
  transactionProcessing = false;
  employeeProcessing = false;

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
      if (!(formData.startDate && formData.endDate)) {
        // don't do any validation
        return;
      }
      if (this.parseDate(formData.startDate) > this.parseDate(formData.endDate)) {
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
      if (this.parseDate(formData.startDate) > this.parseDate(formData.endDate)) {
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

  /**
   * Expects a date in the format "YYYY-MM-DD" (2020-02-03)
   * @param date: date string formatted as YYYY-MM-DD
   */
  private parseDate(date: string) {
    const reg = new RegExp('(\\d\\d\\d\\d)-(\\d\\d)-(\\d\\d)');
    const matches = reg.exec(date);
    if (!matches || matches.length !== 4) {
      return new Date();
    }
    return new Date(parseInt(matches[1], 10), parseInt(matches[2], 10) - 1, parseInt(matches[3], 10));
  }

  employeeFormSubmit() {
    const start = this.parseDate(this.dateFormEmployees.get('startDate').value);
    console.log(this.dateFormEmployees.get('startDate').value);
    const end = this.parseDate(this.dateFormEmployees.get('endDate').value);
    this.employeeProcessing = true;
    this.analyticsService.getAllEmployeeMetrics(start, end).then(res => {
      this.dateFormEmployees.reset();
      this.employeeProcessing = false;
    });
  }

  transactionFormSubmit() {
    const start = this.parseDate(this.dateFormTransaction.get('startDate').value);
    const end = this.parseDate(this.dateFormTransaction.get('endDate').value);
    this.transactionProcessing = true;
    this.analyticsService.getTransactionData(start, end).then(res => {
      this.dateFormTransaction.reset();
      this.transactionProcessing = false;
    });
  }
}
