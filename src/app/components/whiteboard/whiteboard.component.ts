import { Component, OnInit } from "@angular/core";
import { OrderRequestService } from "../../services/order-request.service";
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  Validators,
} from "@angular/forms";
import { BehaviorSubject } from "rxjs/BehaviorSubject";
import { Item } from "../../models/item";
import { OrderRequest } from "../../models/orderRequest";
import { Action } from "../../models/action";
import { AuthenticationService } from "../../services/authentication.service";
import { Observable } from "rxjs/Observable";
import { TransactionService } from "../../services/transaction.service";
import { Transaction } from "../../models/transaction";

@Component({
  selector: "app-whiteboard",
  templateUrl: "./whiteboard.component.html",
  styleUrls: ["./whiteboard.component.css"],
})
export class WhiteboardComponent implements OnInit {
  constructor(
    private orderRequestService: OrderRequestService,
    private fb: FormBuilder,
    private authService: AuthenticationService,
    private transactionService: TransactionService
  ) {}

  isAdmin = this.authService.isAdmin;

  numberRequested: number;
  // Tracks if the form's changes are synced with the backend.
  formSynced = new BehaviorSubject<boolean>(true);
  // Array that holds copies of each OrderRequest and its FormGroup
  orderRequestsWithForms = new BehaviorSubject(null);
  // storing OrderRequests in FormArray allows for inline form updates
  orderRequests: BehaviorSubject<OrderRequest[]> = new BehaviorSubject<
    OrderRequest[]
  >(null);
  // components of the form to create a new order request
  stagedItem: BehaviorSubject<Item> = new BehaviorSubject<Item>(null);
  stagedOrderItemForm = this.fb.group({
    request: ["", Validators.required],
    quantity: [0, Validators.required],
    transactionID: [""],
  });

  ngOnInit() {
    // Subscribe to updates to OrderRequest Array
    this.orderRequests.subscribe((newRequests) => {
      // If new requests were returned, populate the form array.
      if (newRequests) this.populateFormArray(newRequests);
    });
    // Get latest 35 requests by default.
    this.numberRequested = 35;
    this.orderRequestService
      .getLatestRequests(this.numberRequested)
      .then((res) => this.orderRequests.next(res));
  }

  /**
   * (Re)populate the "orderRequestsWithForms" Array
   * @param newRequests: Array of new requests to populate FormArray with
   */
  populateFormArray(newRequests: OrderRequest[]) {
    const newForms = [];
    for (const request of newRequests) {
      const group = this.orderReqToForm(request);
      // Now, subscribe to item state changes for the values that are editable.
      this.setSubscriptions(group, request);
      // Push an object to hold both the request and its form.
      newForms.push({ form: group, request: request });
    }
    // Push new array to BehaviorSubject
    this.orderRequestsWithForms.next(newForms);
  }

  /**
   * Subscribes to value changes in FormGroup, so that the order request
   * can be updated on the backend seamlessly.
   * @param group FormGroup holding order request data
   * @param request: Request this FormGroup corresponds to.
   */
  setSubscriptions(group: FormGroup, request: OrderRequest) {
    /*
     * For all controls, we would like to immediately mark the form as
     *  out of sync when changes occur.
     */
    for (let control of [
      "request",
      "supplier",
      "quantity",
      "status",
      "transaction",
    ]) {
      group.controls[control].valueChanges.subscribe(() =>
        this.formSynced.next(false)
      );
    }
    /*
     * We choose a longer debounce time for actually pushing data to backend.
     * Note that text boxes have longer debounce time to reduce chance that
     * half entered data will be pushed.
     */
    group.controls["request"].valueChanges
      .debounceTime(700)
      .subscribe((req) => {
        /**
         * Note: we don't really care what the new request object from backend
         * looks like, because the user will already see the updates they made.
         * This applies to all the editable items.
         */
        this.orderRequestService
          .setRequestString(request, req)
          .then((newReq) => this.formSynced.next(true));
      });
    group.controls["supplier"].valueChanges
      .debounceTime(700)
      .subscribe((supplier) => {
        this.orderRequestService
          .setSupplier(request, supplier)
          .then((newReq) => this.formSynced.next(true));
      });
    group.controls["quantity"].valueChanges
      .debounceTime(300)
      .subscribe((quantity) => {
        this.orderRequestService
          .setQuantity(request, quantity)
          .then((newReq) => this.formSynced.next(true));
      });
    group.controls["status"].valueChanges
      .debounceTime(700)
      .subscribe((status) => {
        this.orderRequestService
          .setStatus(request, status)
          .then((newReq) => this.formSynced.next(true));
      });
    group.controls["transaction"].valueChanges
      .debounceTime(300)
      .subscribe((transaction) => {
        const transactionNum = parseInt(transaction);
        /**
         * Some notes about this code block:
         * - Validation is a two step process. First we check to make sure
         *   user gave a number, then we confirm the transaction actually exists.
         * - If a form is touched by user, and no errors are set, our ngClass
         *   declaration shows it with 'valid' class decorators
         * - We explicitly unset the touched property after a timeout so that
         *   the valid class does not linger once user finishes their edits.
         * - The untouched, valid form has no css decorators (hence the reset)
         */
        // Validate that user entered a number
        if (isNaN(transactionNum)) {
          // Don't mark the form as valid, reset it to pristine state.
          // Use timeout so this can happen after user stops touching form.
          setTimeout(
            () => group.controls["transaction"].markAsPristine(),
            500
          );
          // Do not PUT to backend.
          return;
        } 
        // Make sure the transaction exists.
        this.transactionService.getTransactionIDs().then((res) => {
          if (!res.includes(transactionNum)) {
            // Not a valid transaction number, don't continue.
            // Mark form as invalid so we get 'invalid' css.
            group.controls["transaction"].setErrors({ incorrect: true });
            return;
          }
          this.transactionService
            .getTransaction(String(transactionNum))
            .then((res) => {
              this.orderRequestService
                .setTransaction(request, res)
                .then((newReq) => {
                  this.formSynced.next(true);
                  /*
                   * After a delay, mark the form as pristine to remove
                   * the 'valid' class decorations
                   */
                  setTimeout(
                    () => group.controls["transaction"].markAsPristine(),
                    1000
                  );
                });
            });
        });
      });
  }

  /**
   * Converts an order request to a filled out FormGroup
   * @param req: Order Request to convert
   */
  orderReqToForm(req: OrderRequest): FormGroup {
    return this.fb.group({
      request: [req.request, Validators.required],
      quantity: [req.quantity, Validators.required],
      transaction: [req.transaction || "None"],
      status: [req.status, Validators.required],
      supplier: [req.supplier],
    });
  }

  /**
   * Converts a FormGroup into an OrderRequest
   * @param form: FormGroup to convert
   */
  formToOrderReq(form: AbstractControl): OrderRequest {
    return {
      _id: <number>form.get("id").value,
      request: <string>form.get("request").value,
      item: <Item>form.get("item_ref").value,
      quantity: <number>form.get("quantity").value,
      transaction: <number>form.get("transaction").value,
      orderRef: <string>form.get("associatedOrder").value,
      status: <string>form.get("status").value,
      supplier: <string>form.get("supplier").value,
      actions: <Action[]>form.get("actions").value,
    };
  }
}
