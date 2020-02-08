import { Component, OnInit } from '@angular/core';
import {OrderService} from '../../services/order.service';
import {Order} from '../../models/order';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {Item} from '../../models/item';

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

  orderForm = this.formBuilder.group({
    // supplier, required, with every order
    supplier: ['', Validators.required],
  });
  // tracks items in order before we submit
  orderItems: Item[];
  orders = [];

  constructor(private orderService: OrderService, private formBuilder: FormBuilder) { }

  ngOnInit() {

  }

  /**
   * Creates a new order
   * @param supplier: supplier for the order
   */
  newOrder(supplier: string) {
    this.orderService.createOrder()
  }

  /**
   * Gets orders between the ranges of start and end date (set via instance variables)
   */
  getOrders() {
    this.orderService.getOrders(this.start.getTime(), this.end.getTime())
      .then(orders => this.orders = orders)
      .catch(err => console.log(err));
  }


}
