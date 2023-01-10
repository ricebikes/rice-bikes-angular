// import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
// import { OrderRequestService } from "../../services/order-request.service";
// import { OrderService } from "../../services/order.service";
// import {
//   FormBuilder,
//   FormControl,
//   FormGroup,
//   Validators,
// } from "@angular/forms";
// import { BehaviorSubject } from "rxjs/BehaviorSubject";
// import { Item } from "../../models/item";
// import { OrderRequest } from "../../models/orderRequest";
// import { AuthenticationService } from "../../services/authentication.service";
// import { AddItemComponent } from "../add-item/add-item.component";
// import { OrderSelectorComponent } from "../orders/order-selector/order-selector.component";
// import { OrderRequestSelectorComponent } from "../whiteboard/order-request-selector/order-request-selector.component";
// import { Order } from "../../models/order";
// import { TransactionService } from "../../services/transaction.service";


// /**
//  * Simple internal Class, used to store Order Request objects with their form
//  */
// class OrderRequestContainer {
//   form: FormGroup;
//   request: OrderRequest;
//   transaction_str: String;
//   urgent: boolean;
// }

// @Component({
//   selector: "app-whiteboard",
//   templateUrl: "./whiteboard.component.html",
//   styleUrls: ["./whiteboard.component.css"],
// })
// export class WhiteboardComponent implements OnInit {
//   @ViewChild('addItemComponent') addItemComponent: AddItemComponent;
//   @ViewChild('orderSelectorComponent') OrderSelectorComponent: OrderSelectorComponent;
//   @ViewChild('orderRequestSelectorComponent') orderRequestSelectorComponent: OrderRequestSelectorComponent;

//   constructor(
//     private orderRequestService: OrderRequestService,
//     private fb: FormBuilder,
//     private authService: AuthenticationService,
//     private orderService: OrderService,
//     private transactionService: TransactionService
//   ) { }

//   isAdmin = this.authService.isAdmin;

//   // Observable of total number of requests known to backend.
//   totalNumRequests: Promise<number>;

//   // Current order request that addItem modal will add item to
//   private currentSelectedRequestIdx: number;

//   // Form to set restock quantity
//   restockQuantityForm = this.fb.group({
//     quantity: ['', Validators.compose([Validators.required, WhiteboardComponent.nonZero])]
//   });
//   // Selected item for detailed view in modal
//   selectedDetailItem: Item;
//   // Number of orders requested to view
//   numberRequested: number;
//   // Selected order request for actions view
//   actionsViewOrderReq: OrderRequest;
//   // Tracks if the form's changes are synced with the backend.
//   formSynced = new BehaviorSubject<boolean>(true);
//   // Array that holds copies of each OrderRequest and its FormGroup
//   orderRequestsWithForms: OrderRequestContainer[] = [];
//   // storing OrderRequests in FormArray allows for inline form updates
//   orderRequests: BehaviorSubject<OrderRequest[]> = new BehaviorSubject<
//     OrderRequest[]
//   >(null);


//   ngOnInit() {
//     // Subscribe to updates to OrderRequest Array
//     this.orderRequests.subscribe((newRequests) => {
//       // If new requests were returned, populate the form array.
//       if (newRequests) this.populateFormArray(newRequests);
//     });
//     this.totalNumRequests = this.orderRequestService.getDistinctIDs().then(res => res.length);
//     // Get latest 50 requests by default.
//     this.numberRequested = 50;
//     this.orderRequestService
//       .getLatestRequests(this.numberRequested)
//       .then((res) => this.orderRequests.next(res));
//   }


//   /**
//    * Convert Order Request to order request container
//    * @param request request to convert
//    */
//   orderRequestToContainer(request: OrderRequest) {
//     const group = this.orderReqToForm(request);
//     // Now, subscribe to item state changes for the values that are editable.
//     this.setSubscriptions(group, request);
//     // Make a human readable transaction string for the object we push
//     let transaction_str = "";
//     for (let transaction of request.transactions) {
//       transaction_str += (transaction + ", ");
//     }
//     if (transaction_str == "") {
//       transaction_str = "None";
//     } else {
//       transaction_str = transaction_str.slice(0, -2); // Remove last comma
//     }
//     // Request is urgent if minimum stock is nonzero, and current stock is less than or equal to minimum.
//     const urgent = (request.status != 'Completed')
//       && (request.itemRef != null)
//       && (request.itemRef.minimum_stock != null)
//       && (request.itemRef.minimum_stock > 0)
//       && (request.itemRef.stock <= request.itemRef.minimum_stock)
//     // Push an object to hold both the request and its form.
//     return { form: group, request: request, transaction_str: transaction_str, urgent: urgent };
//   }

//   /**
//    * (Re)populate the "orderRequestsWithForms" Array
//    * @param newRequests: Array of new requests to populate FormArray with
//    */
//   populateFormArray(newRequests: OrderRequest[]) {
//     const newForms: OrderRequestContainer[] = [];
//     for (const request of newRequests) {
//       // Push an object to hold both the request and its form.
//       newForms.push(this.orderRequestToContainer(request));
//     }
//     // Push new array to BehaviorSubject
//     this.orderRequestsWithForms = newForms;
//   }

//   /**
//    * Subscribes to value changes in FormGroup, so that the order request
//    * can be updated on the backend seamlessly.
//    * @param group FormGroup holding order request data
//    * @param request: Request this FormGroup corresponds to.
//    */
//   setSubscriptions(group: FormGroup, request: OrderRequest) {
//     /*
//      * For all controls, we would like to immediately mark the form as
//      *  out of sync when changes occur.
//      */
//     for (let control of [
//       "request",
//       "quantity",
//       "partNumber",
//       "notes"
//     ]) {
//       group.controls[control].valueChanges.subscribe(() =>
//         this.formSynced.next(false)
//       );
//     }
//     /*
//      * We choose a longer debounce time for actually pushing data to backend.
//      * Note that text boxes have longer debounce time to reduce chance that
//      * half entered data will be pushed.
//      */
//     group.controls["request"].valueChanges
//       .debounceTime(700)
//       .subscribe((req) => {
//         /**
//          * Note: we don't really care what the new request object from backend
//          * looks like, because the user will already see the updates they made.
//          * This applies to all the editable items.
//          */
//         if (req) {
//           // If request string was null, don't attempt update
//           this.orderRequestService
//             .setRequestString(request, req)
//             .then((newReq) => {
//               this.formSynced.next(true);
//               request.actions = newReq.actions;
//             });
//         }
//       });
//     group.controls["quantity"].valueChanges
//       .debounceTime(300)
//       .subscribe((quantity) => {
//         if (group.controls["quantity"].valid) {
//           this.orderRequestService
//             .setQuantity(request, quantity)
//             .then((newReq) => {
//               this.formSynced.next(true);
//               request.actions = newReq.actions;
//             });
//         }
//       });
//     group.controls["partNumber"].valueChanges
//       .debounceTime(300)
//       .subscribe((partNum) => {
//         if (!partNum) {
//           // Set part number to empty string
//           partNum = '';
//         }
//         this.orderRequestService.setPartNum(request, partNum)
//           .then((newReq) => {
//             this.formSynced.next(true);
//             request.actions = newReq.actions;
//           });
//       });
//     group.controls["notes"].valueChanges
//       .debounceTime(300)
//       .subscribe((notes) => {
//         if (!notes) {
//           // Set notes to empty string
//           notes = '';
//         }
//         this.orderRequestService.setNotes(request, notes)
//           .then((newReq) => {
//             this.formSynced.next(true);
//             request.actions = newReq.actions;
//           });
//       });
//   }

//   /**
//    * Validator to be sure a number is greater than zero
//    * @param Control: control to validate
//    */
//   static nonZero(control: FormControl): { [key: string]: any; } {
//     if (Number(control.value) <= 0) {
//       return { nonZero: true };
//     } else {
//       return null;
//     }
//   }

//   /**
//    * Converts an order request to a filled out FormGroup.
//    * Only the fields that should be editable are included in this form.
//    * @param req: Order Request to convert
//    */
//   orderReqToForm(req: OrderRequest): FormGroup {
//     return this.fb.group({
//       request: [req.request, Validators.required],
//       quantity: [{ value: req.quantity, disabled: req.status == 'Completed' }, Validators.compose([Validators.required, WhiteboardComponent.nonZero])],
//       partNumber: [req.partNumber],
//       notes: [req.notes],
//     });
//   }

//   /**
//    * Adds the item emitted from the add item dialog to the order request at "currentSelectedRequestIdx"
//    * @param item Item to add to order request
//    */
//   addSelectedItem(item: Item) {
//     // Save the current requested index, in case it changes before the promise returns.
//     const currentRequestIdx = this.currentSelectedRequestIdx;
//     this.orderRequestService.setItem(this.orderRequestsWithForms[currentRequestIdx].request, item)
//       .then(newReq => {
//         this.orderRequestsWithForms[currentRequestIdx] = this.orderRequestToContainer(newReq);
//       })
//   }

//   /**
//    * Triggers item selection modal
//    * @param request_idx: Index of order request that item should be added to.
//    */
//   triggerItemSelectModal(request_idx: number) {
//     this.currentSelectedRequestIdx = request_idx;
//     // Now, trigger the item dialog. This is the only place we should trigger the dialog.
//     this.addItemComponent.triggerItemSearch();
//   }

//   /**
//    * Sets the item for the detailed item view modal
//    * @param orderReqIdx Index of orderRequest to set item to for detailed view
//    */
//   setItemForDetailedView(orderReqIdx: number) {
//     // Just set the item here. The button calling this function should trigger the modal.
//     this.selectedDetailItem = this.orderRequestsWithForms[orderReqIdx].request.itemRef;
//   }

//   /**
//    * Sets the order request that will be used to populate the past actions modal. Modal will be triggered by button calling this function.
//    * @param orderRequest order request to set
//    */
//   setOrderReqForActionsView(orderRequest: OrderRequest) {
//     this.actionsViewOrderReq = orderRequest;
//   }

//   /**
//    * Launches Order Selection, and saves the current order request, so that we can set an 
//    * order for it once the selection modal emits an event.
//    * @param request_idx: Index of order request Order should be added to.
//    */
//   triggerOrderSelectModal(request_idx: number) {
//     // Save current Order Request index.
//     this.currentSelectedRequestIdx = request_idx;
//     this.OrderSelectorComponent.triggerOrderSelection();
//   }

//   /**
//    * Adds the order emitted from the order selection component to the order request at
//    * "currentSelectedRequestIdx" [should have been set by function triggerOrderSelectModal()].
//    * @param order Order to add to the order request that we saved an index for.
//    */
//   addSelectedOrder(order: Order) {
//     // Save the selected request idx
//     const currentIdx = this.currentSelectedRequestIdx;
//     // Set the order.
//     this.orderService.addOrderRequest(order, this.orderRequestsWithForms[currentIdx].request)
//       .then(newOrder => {
//         const currentOrderReqId = this.orderRequestsWithForms[currentIdx].request._id;
//         const newOrderReq = newOrder.items.filter(x => x._id == currentOrderReqId)[0];
//         this.orderRequestsWithForms[currentIdx] = this.orderRequestToContainer(newOrderReq);
//       });
//   }

//   /**
//    * Adds an order request to the list of visible order requests on the 
//    * whiteboard.
//    * @param req OrderRequest to add
//    */
//   addSelectedOrderReq(req: OrderRequest) {
//     this.orderRequestsWithForms.unshift(this.orderRequestToContainer(req));
//     this.numberRequested++;
//     this.totalNumRequests = this.orderRequestService.getDistinctIDs().then(res => res.length);
//   }

//   /**
//    * Remove Order Request at  index "idx" from it's Order
//    * @param idx Index of order request to remove order for
//    */
//   removeOrderFromRequest(idx) {
//     // ID is the only required field here, and we have it stored in the order request, so make "dummy" object
//     let order: Order = <Order>{
//       _id: this.orderRequestsWithForms[idx].request.orderRef,
//     };
//     this.orderService.disassociateOrderRequest(order, this.orderRequestsWithForms[idx].request)
//       .then(newOrder => {
//         // Just need to clear the orderRef value in our local copy of the data, no need to pull from backend
//         this.orderRequestsWithForms[idx].request.orderRef = null;
//       })
//   }

//   /**
//    * Deletes the order request at "currentSelectedRequestIdx"
//    */
//   confirmDeleteOrderRequest() {
//     const targetIdx = this.currentSelectedRequestIdx;
//     this.orderRequestService.deleteRequest(this.orderRequestsWithForms[targetIdx].request)
//       .then(() => {
//         this.orderRequestsWithForms.splice(targetIdx, 1);
//         this.numberRequested--;
//         this.totalNumRequests = this.orderRequestService.getDistinctIDs().then(res => res.length);
//       });
//   }

//   /**
//    * Loads more order requests.
//    */
//   loadMoreRequests() {
//     this.numberRequested += 50;
//     this.orderRequestService
//       .getLatestRequests(this.numberRequested)
//       .then((res) => this.orderRequests.next(res));
//     this.totalNumRequests = this.orderRequestService.getDistinctIDs().then(res => res.length);
//   }

//   /**
//    * Opens the order request creation modal, the component responsible for
//    * creating (and then emitting) new order requests
//    */
//   openOrderRequestCreationModal() {
//     this.orderRequestSelectorComponent.launchOrderRequestCreator();
//   }
// }
