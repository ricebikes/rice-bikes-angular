import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { OrderService } from '../../../services/order.service';
import { Order } from '../../../models/order';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Item } from '../../../models/item';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Transaction } from '../../../models/transaction';
import { OrderRequest } from '../../../models/orderRequest';
import { OrderRequestService } from '../../../services/order-request.service';
import { NewOrderComponent } from '../new-order/new-order.component';
import { AlertService } from '../../../services/alert.service';
import { Subject } from 'rxjs';
import { AuthenticationService } from '../../../services/authentication.service';

@Component({
  selector: 'app-order-detail',
  templateUrl: './order-detail.component.html',
  styleUrls: ['./order-detail.component.css']
})
export class OrderDetailComponent implements OnInit {

  @ViewChild('freightChargeModalBtn') freightChargeModalBtn: ElementRef;

  loading = true;
  editingNotes = false;
  displayNotes = '';
  order: BehaviorSubject<Order> = new BehaviorSubject(null);
  allOrderItems: FormGroup; // holding OrderItems in FormGroup allows for inline updates
  stagedOrderItem: BehaviorSubject<Item> = new BehaviorSubject(null);
  freightChargeForm = new FormControl('', Validators.required);
  notesForm = new FormControl('');
  isAdmin = this.authService.isAdmin;

  constructor(private orderService: OrderService,
    private orderRequestService: OrderRequestService,
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private alertService: AlertService,
    private authService: AuthenticationService) { }

  ngOnInit() {
    // Subscribe to order updates, so we can fill the FormArray with order data
    this.order.subscribe(newOrder => {
      if (newOrder) {
        this.allOrderItems = this.fb.group({ items: this.fb.array([]) });
        const itemsControl = <FormArray>this.allOrderItems.get('items');
        for (const item of newOrder.items) {
          itemsControl.push(this.orderItemToForm(item));
        }
        if (newOrder.notes) {
          this.displayNotes = newOrder.notes.replace(/\n/g, "</br>"); // Since notes are rendered as html
          this.notesForm.setValue(newOrder.notes);
        } else {
          this.displayNotes = '';
          this.notesForm.setValue('');
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
  }

  /**
   * Updates notes for an order, using the notesForm to get the new value for the order's notes
   */
  updateNotes() {
    this.orderService.updateNotes(this.order.value, this.notesForm.value)
      .then(newOrder => this.order.next(newOrder));
    this.editingNotes = false;
  }

  /**
   * Returns a filled FormControl for an orderItem
   * @param item: orderItem to fill control using
   */
  orderItemToForm(item: OrderRequest): FormGroup {
    return this.fb.group({
      _id: [item._id], // not displayed but helps keep track of the OrderRequest in form
      name: [item.itemRef.name],
      wholesale_cost: [item.itemRef.wholesale_cost],
      standard_price: [item.itemRef.standard_price],
    //   stock: [item.itemRef.stock],
      transactions: [item.transactions],
      quantity: [item.quantity, Validators.required], // make this required, as it is the only component we will allow to be edited
      status: [item.status]
    });
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
      .then(newOrder => this.order.next(newOrder))
      .catch(err => {
        const body = JSON.parse(err._body);
        if (err.status == 400 && body.problemTransactions) {
          console.log(body.problemTransactions);
          this.alertService.warning("Order Cannot be Reopened",
            `This order has requests associated with transactions ${body.problemTransactions}, which are completed. Reopen these transactions to reopen the order`,
            400,
            false);
        } else {
          // Send error alert to user.
          let message = err.message;
          if (!message) {
            message = JSON.stringify(err);
          }
          this.alertService.error(err.statusText, message, err.status)
        }
      });
  }

  /**
   * Sets the freight charge for an order, based on the freightChargeForm
   */
  setFreightCharge() {
    const charge = parseFloat(this.freightChargeForm.value);
    this.orderService.updateFreightCharge(this.order.getValue(), charge)
      .then(newOrder => {
        this.order.next(newOrder);
        this.freightChargeForm.reset();
        this.freightChargeModalBtn.nativeElement.click();
      });
  }

  /**
   * Deletes an item from this order
   * @param item: the OrderRequest to remove
   */
  removeItemFromOrder(item: OrderRequest) {
    this.orderService.disassociateOrderRequest(this.order.value, item)
      .then(newOrder => this.order.next(newOrder));
  }

  /**
   * Convenience function to get all order controls
   */
  getItemControls() {
    const controlArray = <FormArray>this.allOrderItems.get('items');
    return controlArray.controls;
  }

  /**
   * Updates the quantity of an order request.
   * @param index: index of OrderRequest in form to update.
   * @param quantity: quantity value to set
   */
  updateRequestQuantity(index: number, quantity: number) {
    let orderReqId = (<FormArray>this.allOrderItems.get('items')).at(index).get('_id').value;
    this.orderRequestService.setQuantity(<OrderRequest>{ _id: orderReqId }, quantity)
      .then(newReq => {
        this.orderService.getOrder(this.order.value._id).then(newOrder => this.order.next(newOrder));
      });
  }

  /**
   * Removes Order Request from ID
   * @param index index of OrderRequest in form to delete.
   */
  removeRequestFromOrder(index: number) {
    let orderReqId = (<FormArray>this.allOrderItems.get('items')).at(index).get('_id').value;
    this.orderService.disassociateOrderRequest(this.order.value, <OrderRequest>{ _id: orderReqId })
      .then(newOrder => {
        this.order.next(newOrder);
      })
  }
}
