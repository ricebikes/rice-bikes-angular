import { Component, OnInit, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Order } from '../../../models/order';
import { OrderService } from "../../../services/order.service";

@Component({
  selector: 'app-order-selector',
  templateUrl: './order-selector.component.html',
  styleUrls: ['./order-selector.component.css']
})
export class OrderSelectorComponent implements OnInit {

  // Emit this order to the listening component when selected
  @Output() chosenOrder = new EventEmitter<Order>();

  // Reference to HTML element that closes and opens modal
  @ViewChild('orderSelectionModalTrigger') orderSelectionModalTrigger: ElementRef;

  constructor(private orderService: OrderService) { }

  activeOrders: Promise<any>;

  // Fillable form to make new order
  newOrderForm = new FormGroup( {
    supplier: new FormControl('', Validators.required)
  });

  ngOnInit() {
    this.activeOrders = this.orderService.getActiveOrders();
  }

  /**
    * Makes string of item names from an order, terminating with an ellipses when the
    * string gets too long
    * @param order: Order to make item string for
    */
  makeItemString(order: Order) {
    if (order.items.length == 0) { return "None" }
    let itemString = order.items[0].itemRef.name;
    for (let i = 1; i < order.items.length; i++) {
      if (itemString.length > 40) {
        itemString = itemString.concat('...');
        break;
      }
      itemString = itemString.concat(', ');
      itemString = itemString.concat(order.items[i].itemRef.name);
    }
    return itemString;
  }

  /**
   * Creates an order. As soon as the order is created, will emit the order so that calling
   * component can use it.
   */
  createAndEmitOrder() {
    // Get supplier name from form
    let supplierName = this.newOrderForm.controls['supplier'].value;
    this.orderService.createOrder(supplierName).then(newOrder => {
      this.selectOrder(newOrder);
    })
  }

  /**
   * Called by another component to trigger the order selection dialog
   */
  triggerOrderSelection() {
    // Refresh active orders
    this.activeOrders = this.orderService.getActiveOrders();
    this.orderSelectionModalTrigger.nativeElement.click();
  }

  /**
   * Selects order, and emits it to listeners.
   * Closes the Order list.
   * 
   * @param order order to select.
   */
  selectOrder(order: Order) {
    // Emit the order to listeners.
    this.chosenOrder.emit(order);
    this.orderSelectionModalTrigger.nativeElement.click();
  }
}
