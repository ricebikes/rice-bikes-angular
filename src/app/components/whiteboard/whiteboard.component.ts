import { Component, OnInit } from "@angular/core";
import { OrderRequestService } from "../../services/order-request.service";
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import { BehaviorSubject } from "rxjs/BehaviorSubject";
import { Item } from "../../models/item";
import { OrderRequest } from "../../models/orderRequest";
import { AuthenticationService } from "../../services/authentication.service";
import { TransactionService } from "../../services/transaction.service";

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
      // Make a human readable transaction string for the object we push
      let transaction_str = "";
      for (let transaction of request.transactions) {
        transaction_str += (transaction + ", ");
      }
      transaction_str = transaction_str.slice(0,-2); // Remove last comma
      // Push an object to hold both the request and its form.
      newForms.push({ form: group, request: request, transaction_str: transaction_str});
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
      "quantity",
      "partNumber",
      "notes"
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
    group.controls["quantity"].valueChanges
      .debounceTime(300)
      .subscribe((quantity) => {
        if (group.controls["quantity"].valid) {
          this.orderRequestService
            .setQuantity(request, quantity)
            .then((newReq) => this.formSynced.next(true));
        }
      });
    group.controls["partNumber"].valueChanges
      .debounceTime(300)
      .subscribe((partNum) => {
        this.orderRequestService.setPartNum(request, partNum)
        .then((newReq) => this.formSynced.next(true));
      });
    group.controls["notes"].valueChanges
      .debounceTime(300)
      .subscribe((notes) => {
        this.orderRequestService.setNotes(request, notes)
        .then((newReq) => this.formSynced.next(true));
      });
  }

  /**
   * Validator to be sure a number is greater than zero
   * @param Control: control to validate
   */
  static nonZero(control:FormControl):{ [key: string]: any; } {
    if (Number(control.value) <= 0) {
      return {nonZero: true};
    } else {
      return null;
    }
  }

  /**
   * Converts an order request to a filled out FormGroup.
   * Only the fields that should be editable are included in this form.
   * @param req: Order Request to convert
   */
  orderReqToForm(req: OrderRequest): FormGroup {
    return this.fb.group({
      request: [req.request, Validators.required],
      quantity: [req.quantity, Validators.compose([Validators.required, WhiteboardComponent.nonZero])],
      partNumber: [req.partNumber],
      notes: [req.notes],
    });
  }

}
