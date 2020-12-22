import { Component, ElementRef, OnInit, Output, Input, ViewChild, EventEmitter, OnChanges } from '@angular/core';
import { FormBuilder, Validators, FormControl, FormGroup } from '@angular/forms';
import { Order } from '../../../models/order';
import { OrderRequest } from '../../../models/orderRequest';
import { OrderRequestService } from '../../../services/order-request.service';
import { TransactionService } from '../../../services/transaction.service';
import { Transaction } from '../../../models/transaction';

@Component({
  selector: 'app-order-request-selector',
  templateUrl: './order-request-selector.component.html',
  styleUrls: ['./order-request-selector.component.css']
})
export class OrderRequestSelectorComponent implements OnInit, OnChanges {

  @ViewChild('orderRequestModalButton') orderRequestModalButton: ElementRef;

  // If set to true, the component will only permit order request creation
  @Input('create_only') create_only: boolean;
  /**
   * If non-null, the component will default to the given transaction
   * and not allow modification
   */
  @Input('preset_transaction') preset_transaction: Transaction;

  @Output() chosenRequest = new EventEmitter<OrderRequest>();

  activeOrderRequests: Promise<OrderRequest[]>; // all active order requests
  availableOrderRequests: Promise<OrderRequest[]>; // requests to show in selector

  stagedOrderRequestForm = this.fb.group({
    request: [null, Validators.required],
    partNum: [null],
    quantity: [null],
    restock: [false, Validators.required],
    transactionID: [null, Validators.nullValidator, (fg: FormControl) => {
      /**
       * Async validator to verify transaction exists. Requests all transaction IDs
       * and will throw validation error if the provided ID is not in list.
       */
      if (fg.value == null || fg.value == "") {
        // Immediately resolve the transaction field as valid if one is not set.
        return new Promise((resolve, reject) => { resolve(null) });
      }
      return this.transactionService.getTransactionIDs().then(ids => {
        // Check if the transaction ID in form is in list.
        return (ids.includes(parseInt(fg.value))) ? null : { badTransactionID: true };
      });
    }],
  }, {
    validator: (fg: FormGroup) => {
      // Custom validator, to ensure that either the quantity is valid, or restock is true.
      const restock = fg.get('restock').value;
      const quantity = fg.get('quantity').value;
      return (!restock && (quantity <= 0 || quantity == null)) ? { badQuantity: true } : null;
    }
  });


  // Set to true when the user clicks button to create a new whiteboard entry
  createMode = false;

  constructor(private orderRequestService: OrderRequestService,
    private fb: FormBuilder,
    private transactionService: TransactionService) { }

  ngOnInit() {
    this.activeOrderRequests = this.orderRequestService.getActiveRequests();
    // If the transaction ID is set, filter out order requests associated with transaction
    this.availableOrderRequests = this.activeOrderRequests.then(requests => {
      if (this.preset_transaction != null) {
        // Filter requests that are in the transaction
        return requests.filter(candidate => {
          return this.preset_transaction.orderRequests.findIndex(x => x._id == candidate._id) == -1;
        })
      } else {
        return requests;
      }
    })
    this.createMode = this.create_only;
    if (this.preset_transaction != null) {
      this.stagedOrderRequestForm.get('transactionID').setValue(this.preset_transaction._id);
    }
  }

  /**
   * This lifecycle hook runs when the inputs to the component change. Useful
   * since the present_transaction value can change after component is 
   * initialized.
   * @param changes Object containing changed properties
   */
  ngOnChanges(changes) {
    if (changes.preset_transaction) {
      this.preset_transaction = changes.preset_transaction.currentValue;
      if (this.preset_transaction) {
        this.stagedOrderRequestForm.get('transactionID').setValue(this.preset_transaction._id);
        // If the transaction ID is set, filter out order requests associated with transaction
        this.availableOrderRequests = this.activeOrderRequests.then(requests => {
          if (this.preset_transaction != null) {
            // Filter requests that are in the transaction
            return requests.filter(candidate => {
              return this.preset_transaction.orderRequests.findIndex(x => x._id == candidate._id) == -1;
            })
          } else {
            return requests;
          }
        })
      }
    }
  }

  /**
   * Launches the order request selector in "selector mode"
   */
  public launchOrderRequestSelector() {
    this.createMode = false;
    this.orderRequestModalButton.nativeElement.click();
  }

  /**
   * Launches the order request selector in "creator mode"
   */
  public launchOrderRequestCreator() {
    this.createMode = true;
    this.orderRequestModalButton.nativeElement.click();
  }

  /**
   * Wrapper, prevents disabling create mode 
   * if the component was set to "create mode only" at startup. Good for
   * usage in whiteboard component, where selecting an existing order request
   * doesn't make sense.
   */
  disableCreateMode() {
    if (!this.create_only) { this.createMode = false; }
  }

  /**
   * Selects an existing order request, and emits it to listening components.
   * @param req Order Request to Select
   */
  selectOrderRequest(req: OrderRequest) {
    this.chosenRequest.emit(req);
    // Dismiss Modal.
    this.orderRequestModalButton.nativeElement.click();
  }

  /**
   * Make an order request from the staged order form.
   */
  createOrderRequest() {
    // If Restock is set, then the quantity should be negative 1.
    const quantity = this.stagedOrderRequestForm.get('restock').value ?
      -1 : this.stagedOrderRequestForm.get('quantity').value;
    const transactions = this.stagedOrderRequestForm.get('transactionID').value != null ?
      [this.stagedOrderRequestForm.get('transactionID').value] : null;
    this.orderRequestService.createOrderReq(quantity,
      this.stagedOrderRequestForm.get('request').value,
      this.stagedOrderRequestForm.get('partNum').value,
      transactions,
      null).then(newOrderReq => {
        // Emit the new Order Request
        this.chosenRequest.emit(newOrderReq);
        // Close the modal
        this.orderRequestModalButton.nativeElement.click();
        this.stagedOrderRequestForm.reset();
      });
  }
}
