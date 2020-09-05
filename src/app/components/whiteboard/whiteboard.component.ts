import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { OrderRequestService } from '../../services/order-request.service';
import { FormBuilder, Validators } from '@angular/forms';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { OrderRequest } from '../../models/orderRequest';
import { AuthenticationService } from '../../services/authentication.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-whiteboard',
  templateUrl: './whiteboard.component.html',
  styleUrls: ['./whiteboard.component.css']
})
export class WhiteboardComponent implements OnInit {

  constructor(private orderRequestService: OrderRequestService,
    private fb: FormBuilder, private authService: AuthenticationService) { }

  numberRequested: number;
  orderRequests: BehaviorSubject<OrderRequest[]> = new BehaviorSubject<OrderRequest[]>(null);
  isAdmin = this.authService.isAdmin;

  // Reference to the hidden button we click to toggle the request edit modal.
  @ViewChild('editRequestToggle') editRequestToggle: ElementRef;

  /*
   * Stages a new order request.
   */
  stagedOrderItemForm = this.fb.group({
    request: ['', Validators.required],
    quantity: [0, Validators.required],
    transactionID: ['']
  });

  /*
   * Exposes the elements of an order request we expect a user to edit within
   * The popup modal.
   */
  editOrderRequestForm = this.fb.group({
    entryID: ['', Validators.required], // Not displayed but used to track entry to update.
    request: ['', Validators.required],
    status: ['', Validators.required],
    supplier: ['', Validators.required],
    quantity: ['', Validators.required],
    transactionID: ['']
  });

  ngOnInit() {
    // Get latest 35 requests by default.
    this.numberRequested = 35;
    this.orderRequestService.getLatestRequests(this.numberRequested)
      .then(res => this.orderRequests.next(res));
  }

  /**
   * Gets available status options for item. Implemented as observable
   * so this can be moved to backend if desired.
   */
  get statusOptions() {
    return Observable.of(["Not Ordered", "In Cart", "Ordered", "Completed", "Confirming", "Out of Stock"]);
  }

  /**
   * Edits an order request, by activating the modal that allows for 
   * editing and filling in all fields of the request form.
   * @param request Request to edit
   */
  editOrderRequest(request: OrderRequest) {
    // Fill the modal form with this request's values.
    this.editOrderRequestForm.controls['entryID'].setValue(request._id);
    this.editOrderRequestForm.controls['request'].setValue(request.request);
    this.editOrderRequestForm.controls['status'].setValue(request.status);
    this.editOrderRequestForm.controls['supplier'].setValue(request.supplier);
    this.editOrderRequestForm.controls['quantity'].setValue(request.quantity);
    this.editOrderRequestForm.controls['transactionID'].setValue(request.transaction);
    // Trigger the modal.
    this.editRequestToggle.nativeElement.click();
  }

  /**
   * Submits Whiteboard Entry update form. Dismisses Modal, updates entry on
   * backend, and updates frontend list to reflect change.
   */
  submitRequestUpdateForm() {
    if (this.editOrderRequestForm.invalid) {return; }
  }
}