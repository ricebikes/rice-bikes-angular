import { Component, OnInit } from '@angular/core';
import { OrderRequestService } from '../../services/order-request.service';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Item } from '../../models/item';
import { OrderRequest } from '../../models/orderRequest';
import { Action } from '../../models/action';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-whiteboard',
  templateUrl: './whiteboard.component.html',
  styleUrls: ['./whiteboard.component.css']
})
export class WhiteboardComponent implements OnInit {

  constructor(private orderRequestService: OrderRequestService,
    private fb: FormBuilder) { }

  numberRequested: number;
  allOrderRequests = new FormArray([]); // storing OrderRequests in FormArray allows for inline form updates
  orderRequests: BehaviorSubject<OrderRequest[]> = new BehaviorSubject<OrderRequest[]>(null);
  // components of the form to create a new order request
  stagedItem: BehaviorSubject<Item> = new BehaviorSubject<Item>(null);
  stagedOrderItemForm = this.fb.group({
    request: ['', Validators.required],
    quantity: [0, Validators.required],
    transactionID: ['']
  }
  );
  ngOnInit() {
    // Get latest 35 requests by default.
    this.numberRequested = 35;
    this.orderRequestService.getLatestRequests(this.numberRequested)
      .then(res => this.orderRequests.next(res));
  }

  /**
   * Converts an order request to a filled out FormGroup
   * @param req: Order Request to convert
   */
  orderReqToForm(req: OrderRequest): FormGroup {
    return this.fb.group({
      id: [req._id],
      request: [req.request, Validators.required],
      quantity: [req.quantity, Validators.required],
      item_ref: [req.item], // not displayed or editable
      transaction: [req.transaction],
      associatedOrder: [req.orderRef],
      status: [req.status, Validators.required],
      supplier: [req.supplier],
      actions: [req.actions]
    });
  }

  /**
   * Converts a FormGroup into an OrderRequest
   * @param form: FormGroup to convert
   */
  formToOrderReq(form: AbstractControl): OrderRequest {
    return {
      _id: <number>form.get('id').value,
      request: <string>form.get('request').value,
      item: <Item>form.get('item_ref').value,
      quantity: <number>form.get('quantity').value,
      transaction: <number>form.get('transaction').value,
      orderRef: <string>form.get('associatedOrder').value,
      status: <string>form.get('status').value,
      supplier: <string>form.get('supplier').value,
      actions: <Action[]>form.get('actions').value
    };
  }

  /**
   * Update the quantity of an order request.
   * @param i: Index of the target order request in the allOrderRequests FormArray
   * @param quantity: quantity to set the target request to
   */
  updateQuantity(i: number, quantity: number) {
    const allReqs = <FormArray>this.allOrderRequests.get('reqs');
    const targetReq = allReqs.at(i);
    this.orderRequestService.setQuantity(this.formToOrderReq(targetReq), quantity)
      .then(res => {
        // update the individual control in the FormArray
        allReqs.setControl(i, this.orderReqToForm(res));
      });
  }

  /**
   * Update the request description of an order request
   * @param i: Index of the target order request in the allOrderRequests FormArray
   * @param newReq: new request string
   */
  updateRequestString(i: number, newReq: string) {
    const allReqs = <FormArray>this.allOrderRequests.get('reqs');
    const targetReq = allReqs.at(i);
    this.orderRequestService.setRequestString(this.formToOrderReq(targetReq), newReq)
      .then(res => allReqs.setControl(i, this.orderReqToForm(res)));
  }
}

