import {Component, OnInit, ViewChild} from '@angular/core';
import {OrderService} from '../../../services/order.service';
import {Order} from '../../../models/order';
import {ActivatedRoute} from '@angular/router';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {Item} from '../../../models/item';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Transaction} from '../../../models/transaction';
import {AddItemComponent} from '../../add-item/add-item.component';

@Component({
  selector: 'app-order-detail',
  templateUrl: './order-detail.component.html',
  styleUrls: ['./order-detail.component.css']
})
export class OrderDetailComponent implements OnInit {

  @ViewChild('addItemComponent') addItemComponent: AddItemComponent;

  loading = true;
  order: BehaviorSubject<Order> = new BehaviorSubject(null);
  stagedOrderForm: FormGroup;
  stagedOrderItem: BehaviorSubject<Item> = new BehaviorSubject(null);

  constructor(private orderService: OrderService,
              private route: ActivatedRoute,
              private fb: FormBuilder) { }

  ngOnInit() {
    // Get param for the order we should display
    this.route.params.subscribe(params => {
      this.orderService.getOrder(params['_id'])
        .then(newOrder => {
          this.loading = false;
          this.order.next(newOrder);
        });
    });

    this.stagedOrderForm = this.fb.group({
      transaction: [''],
      quantity: ['', Validators.required]
    });
  }

  /**
   * Simply gets formcontrol values and passes them to addItem function
   */
  submitStagedItem() {
    this.addItemToOrder(this.stagedOrderItem.value,
      this.stagedOrderForm.controls['quantity'].value,
      this.stagedOrderForm.controls['transaction'].value);
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
   * Sets staged item in the jumbotron
   * @param item
   */
  setItem(item: Item) {
    this.stagedOrderItem.next(item);
  }

  /**
   * Triggers the item search modal
   */
  triggerItemSearch() {
    this.addItemComponent.triggerItemSearch();
  }

  /**
   * Adds item to order
   * @param item: item to add
   * @param quantity: stock to associate with this item
   * @param transaction: transaction ID to associate
   */
  addItemToOrder(item: Item, quantity: number, transaction?: string) {
    if (transaction) {
      this.orderService.addItem(this.order.getValue(),
        {item: item, transaction: transaction, quantity: quantity})
        .then(newOrder => this.order.next(newOrder));
    } else {
      this.orderService.addItem(this.order.getValue(),
        {item: item, transaction: null, quantity: quantity})
        .then(newOrder => this.order.next(newOrder));
    }
  }
}
