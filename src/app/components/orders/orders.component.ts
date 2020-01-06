import { Component, OnInit } from '@angular/core';
import {OrderService} from '../../services/order.service';
import {Order} from '../../models/order';

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

  orders = [];

  constructor(private orderService: OrderService) { }

  ngOnInit() {
  }

  /**
   * Gets orders between the ranges of start and end date
   */
  getOrders() {
    this.orderService.getOrders(this.start.getTime(), this.end.getTime())
      .then(orders => this.orders = orders)
      .catch(err => console.log(err));
  }

}
