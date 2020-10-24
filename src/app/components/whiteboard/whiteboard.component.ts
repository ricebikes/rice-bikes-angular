import { Component, OnInit, ViewChild } from "@angular/core";
import { OrderRequestService } from "../../services/order-request.service";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import { BehaviorSubject } from "rxjs/BehaviorSubject";
import { Item } from "../../models/item";
import { OrderRequest } from "../../models/orderRequest";
import { AuthenticationService } from "../../services/authentication.service";
import { AddItemComponent } from "../add-item/add-item.component";


/**
 * Simple internal Class, used to store Order Request objects with their form
 */
class OrderRequestContainer {
  form: FormGroup;
  request: OrderRequest;
  transaction_str: String;
}

@Component({
  selector: "app-whiteboard",
  templateUrl: "./whiteboard.component.html",
  styleUrls: ["./whiteboard.component.css"],
})
export class WhiteboardComponent implements OnInit {
  @ViewChild('addItemComponent') addItemComponent: AddItemComponent;
  constructor(
    private orderRequestService: OrderRequestService,
    private fb: FormBuilder,
    private authService: AuthenticationService,
  ) { }

  isAdmin = this.authService.isAdmin;

  // Current order request that addItem modal will add item to
  private currentSelectedRequestIdx: number;

  // Selected item for detailed view in modal
  selectedDetailItem: Item;
  // Number of orders requested to view
  numberRequested: number;
  // Tracks if the form's changes are synced with the backend.
  formSynced = new BehaviorSubject<boolean>(true);
  // Array that holds copies of each OrderRequest and its FormGroup
  orderRequestsWithForms: OrderRequestContainer[] = [];
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
   * Convert Order Request to order request container
   * @param request request to convert
   */
  orderRequestToContainer(request: OrderRequest) {
    const group = this.orderReqToForm(request);
    // Now, subscribe to item state changes for the values that are editable.
    this.setSubscriptions(group, request);
    // Make a human readable transaction string for the object we push
    let transaction_str = "";
    for (let transaction of request.transactions) {
      transaction_str += (transaction + ", ");
    }
    if (transaction_str == "") {
      transaction_str = "None";
    } else {
      transaction_str = transaction_str.slice(0, -2); // Remove last comma
    }
    // Push an object to hold both the request and its form.
    return {form: group, request: request, transaction_str: transaction_str};
  }

  /**
   * (Re)populate the "orderRequestsWithForms" Array
   * @param newRequests: Array of new requests to populate FormArray with
   */
  populateFormArray(newRequests: OrderRequest[]) {
    const newForms: OrderRequestContainer[] = [];
    for (const request of newRequests) {
      // Push an object to hold both the request and its form.
      newForms.push(this.orderRequestToContainer(request));
    }
    // Push new array to BehaviorSubject
    this.orderRequestsWithForms = newForms;
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
  static nonZero(control: FormControl): { [key: string]: any; } {
    if (Number(control.value) <= 0) {
      return { nonZero: true };
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

  /**
   * Adds the item emitted from the add item dialog to the order request at "currentSelectedRequestIdx"
   * @param item Item to add to order request
   */
  addSelectedItem(item: Item) {
    // Save the current requested index, in case it changes before the promise returns.
    console.log("Setting Item");
    const currentRequestIdx = this.currentSelectedRequestIdx;
    this.orderRequestService.setItem(this.orderRequestsWithForms[currentRequestIdx].request, item)
    .then(newReq => {
      console.log("New request")
      this.orderRequestsWithForms[currentRequestIdx] = this.orderRequestToContainer(newReq);
    })
  }

  /**
   * Triggers item selection modal
   * @param request_idx: Index of order request that item should be added to.
   */
  triggerItemSelectModal(request_idx: number) {
    this.currentSelectedRequestIdx = request_idx;
    // Now, trigger the item dialog. This is the only place we should trigger the dialog.
    this.addItemComponent.triggerItemSearch();
  }
  
  /**
   * Sets the item for the detailed item view modal
   * @param orderReqIdx Index of orderRequest to set item to for detailed view
   */
  setItemForDetailedView(orderReqIdx: number) {
    // Just set the item here. The button calling this function should trigger the modal.
    this.selectedDetailItem = this.orderRequestsWithForms[orderReqIdx].request.itemRef;
  }
}
