import {Component, OnInit, ViewChild} from '@angular/core';
import {OrderService} from '../../../services/order.service';
import {Order} from '../../../models/order';
import {ActivatedRoute, Router} from '@angular/router';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {Item} from '../../../models/item';
import {FormArray, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Transaction} from '../../../models/transaction';
import {AddItemComponent} from '../../add-item/add-item.component';
import {debug} from 'util';
import {OrderRequest} from '../../../models/orderRequest';
import {SearchService} from '../../../services/search.service';

@Component({
  selector: 'app-order-detail',
  templateUrl: './order-detail.component.html',
  styleUrls: ['./order-detail.component.css']
})
export class OrderDetailComponent implements OnInit {

  @ViewChild('addItemComponent') addItemComponent: AddItemComponent;

  loading = true;
  order: BehaviorSubject<Order> = new BehaviorSubject(null);
  transactionIDs = this.searchService.getTransactionIDs();
  stagedOrderForm: FormGroup;
  allOrderItems: FormGroup; // holding OrderItems in FormGroup allows for inline updates
  stagedOrderItem: BehaviorSubject<Item> = new BehaviorSubject(null);

  constructor(private orderService: OrderService,
              private searchService: SearchService,
              private route: ActivatedRoute,
              private router: Router,
              private fb: FormBuilder) { }

  ngOnInit() {
    // Subscribe to order updates, so we can fill the FormArray with order data
    this.order.subscribe(newOrder => {
      if (newOrder) {
        this.allOrderItems = this.fb.group({items: this.fb.array([])});
        const itemsControl = <FormArray>this.allOrderItems.get('items');
        for (const item of newOrder.items) {
          itemsControl.push(this.orderItemToForm(item));
        }
      }
    });
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
   * Returns a filled FormControl for an orderItem
   * @param item: orderItem to fill control using
   */
  orderItemToForm(item: OrderRequest): FormGroup {
    return this.fb.group({
      _id: [item.item._id], // not displayed but helps keep track of the item in form
      name: [item.item.name],
      wholesale_cost: [item.item.wholesale_cost],
      standard_price: [item.item.standard_price],
      stock: [item.item.stock],
      transaction: [item.transaction],
      quantity: [item.quantity, Validators.required] // make this required, as it is the only component we will allow to be edited
    });
  }

  /**
   * Simply gets form control values and passes them to addItem function
   */
  submitStagedItem() {
    this.addItemToOrder(this.stagedOrderItem.value,
      this.stagedOrderForm.controls['quantity'].value,
      this.stagedOrderForm.controls['transaction'].value);
    // Reset the staging form
    this.stagedOrderForm.reset();
    this.stagedOrderItem.next(null);
  }

  /**
   * Updates the quantity of an item in the order
   * @param item_id: ObjectId of item to update
   * @param quantity: quantity to set the orderItem to
   */
  updateItemQuantity(item_id: string, quantity: number) {
    this.orderService.updateStock(this.order.value, item_id, quantity)
      .then(newOrder => this.order.next(newOrder));
  }

  /**
   * Deletes this order
   */
  deleteOrder() {
    this.orderService.deleteOrder(this.order.value)
      .then(() => this.router.navigate(['orders/']));
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
   * Deletes an item from this order
   * @param item_id: the objectID of item to remove
   */
  removeItemFromOrder(item_id: string) {
    this.orderService.deleteItem(this.order.value, item_id)
      .then(newOrder => this.order.next(newOrder));
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

  /**
   * Convenience function to get all order controls
   */
  getItemControls() {
    const controlArray = <FormArray> this.allOrderItems.get('items');
    return controlArray.controls;
  }
}
