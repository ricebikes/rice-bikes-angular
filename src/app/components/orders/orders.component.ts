import { Component, OnInit } from '@angular/core';
import {OrderService} from '../../services/order.service';
import {Order} from '../../models/order';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {Item} from '../../models/item';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {Router} from '@angular/router';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css']
})
export class OrdersComponent implements OnInit {
  // set start to one month in past
  start = new Date(Date.now() - 1000 * 60 * 60 * 24 * 7 * 4);
  // set end to right now
  end = new Date();

  orders = new BehaviorSubject<Order[]>([]);

  orderDateForm = this.formBuilder.group({
    startDate: ['', Validators.required],
    endDate: ['', Validators.required]
  });

  constructor(private orderService: OrderService, private formBuilder: FormBuilder, private router: Router) { }

  orderDatesValid = true;
  ngOnInit() {
    this.getOrders();
    this.orderDateForm.valueChanges.subscribe(formData => {
      if (this.parseDate(formData.startDate) > this.parseDate(formData.endDate)) {
        this.orderDatesValid = false;
        // this invalidates the form
        this.orderDateForm.controls['startDate'].setErrors({'incorrect': true});
      } else {
        this.orderDatesValid = true;
        // restores form to normal validation
        this.orderDateForm.controls['startDate'].setErrors(null);
      }
    });
  }

  /**
   * Submits the order form with dates, and reloads the order view
   */
  submitOrderDates() {
    this.start = this.parseDate(this.orderDateForm.controls['startDate'].value);
    this.end = this.parseDate(this.orderDateForm.controls['endDate'].value);
    this.getOrders();
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

  /**
   * Navigates to the url for a selected order
   * @param order: Order url to navigate to
   */
  navigateOrder(order: Order) {
    this.router.navigate(['/orders/', order._id]);
  }

  /**
   * Makes string of item names from an order, terminating with an ellipses when the
   * string gets too long
   */
  makeItemString(order: Order) {
    let itemString = order.items[0].item.name;
    for (let i = 1; i < order.items.length; i++) {
      if (itemString.length > 40) {
        itemString = itemString.concat('...');
        break;
      }
      itemString = itemString.concat(', ');
      itemString = itemString.concat(order.items[i].item.name);
    }
    return itemString;
  }

  /**
   * Gets orders between the ranges of start and end date (set via instance variables)
   */
  getOrders() {
    this.orderService.getOrders(this.start.getTime(), this.end.getTime())
      .then(newOrders => this.orders.next(newOrders));
  }


}
