import { Component, OnInit } from '@angular/core';
import {OrderService} from '../../../services/order.service';
import {Order} from '../../../models/order';
import {ActivatedRoute} from '@angular/router';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {Item} from '../../../models/item';

@Component({
  selector: 'app-order-detail',
  templateUrl: './order-detail.component.html',
  styleUrls: ['./order-detail.component.css']
})
export class OrderDetailComponent implements OnInit {

  loading = true;
  order: BehaviorSubject<Order> = new BehaviorSubject(null);

  constructor(private orderService: OrderService, private route: ActivatedRoute) { }

  ngOnInit() {
    // Get param for the order we should display
    this.route.params.subscribe(params => {
      this.orderService.getOrder(params['_id'])
        .then(newOrder => {
          this.loading = false;
          this.order.next(newOrder);
        });
    });
  }

  /**
   * Sets the status of this order
   * @param status: new status
   */
  setStatus(status: string) {
    this.orderService.updateStatus(this.order.getValue(), status)
      .then(newOrder => this.order.next(newOrder));
  }

  /**
   * Adds item to order
   * @param item: item to add
   */
  addItemToOrder(item: Item) {
    this.orderService.addItem(this.order.getValue(), {item: item, transaction: undefined, quantity: 0})
      .then(newOrder => this.order.next(newOrder));
  }
}
