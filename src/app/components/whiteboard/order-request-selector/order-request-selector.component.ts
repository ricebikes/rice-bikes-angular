import { Component, ElementRef, OnInit, Output, Input, ViewChild, EventEmitter, OnChanges } from '@angular/core';
import { FormBuilder, Validators, FormControl, FormGroup } from '@angular/forms';
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
  transactionIDs = [];

  stagedOrderRequestForm = this.fb.group(
    {
      request: [null, Validators.required],
      partNum: [null],
      quantity: [null],
      transactionID: [null, Validators.compose([Validators.nullValidator, (fg: FormControl) => {
        /**
         * Async validator to verify transaction exists. Requests all transaction IDs
         * and will throw validation error if the provided ID is not in list.
         */
        if (fg.value == null || fg.value == "") {
          // Immediately resolve the transaction field as valid if one is not set.
          return new Promise((resolve, reject) => { resolve(null) });
        }
        return (this.transactionIDs.includes(parseInt(fg.value))) ? null : { badTransactionID: true };
      }])]
    },
    {
      validator: (fg: FormGroup) => {
        const quantity = fg.get('quantity').value;
        return (quantity == null || quantity < 1) ? { badQuantity: true } : null;
      }
    }
  );


  // Set to true when the user clicks button to create a new whiteboard entry
  createMode = false;

  constructor(private orderRequestService: OrderRequestService,
    private fb: FormBuilder,
    private transactionService: TransactionService) { }

  ngOnInit() {
    this.activeOrderRequests = this.orderRequestService.getActiveRequests();
    this.createMode = this.create_only;
    if (this.preset_transaction != null) {
      // We do not need to query transaction IDs. Just put the preset transaction into validator
      this.transactionIDs = [this.preset_transaction._id];
      this.stagedOrderRequestForm.get('transactionID').setValue(this.preset_transaction._id);
    } else {
      this.transactionService.getTransactionIDs().then(res => this.transactionIDs = res);
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
    /**
     * This is not ideal at all, but due to the way that the association between transactions and order requests
     * is defined, the transaction component has no way to distinguish between an existing order request 
     * (which has been emitted by this component, and the transaction component should add itself to) and
     * a newly created order request (which the transaction will already be added to). Due to this, the
     * order request selector must handle adding transactions to existing order requests, as well as new ones.
     * 
     * the alternative to this would be to either:
     * a) make a better architecture for the relationship between transactions and order requests
     * b) split order request selection login into the transaction control
     * 
     * I don't want to rewrite the whole architecture, and I want to keep the validation logic for creating an order request
     * in one component (not both transaction and whiteboard components). Thus we are left with this "solution"
     */
    this.orderRequestService.addTransaction(req, this.preset_transaction._id).then(res => {
      this.chosenRequest.emit(res);
      // Dismiss Modal.
      this.orderRequestModalButton.nativeElement.click();
    })
  }

  /**
   * Make an order request from the staged order form.
   */
  createOrderRequest() {
    const quantity = this.stagedOrderRequestForm.get('quantity').value;
    const transaction_id = this.stagedOrderRequestForm.get('transactionID').value;
    let transactions = []
    if (transaction_id) {
      /**
       * Internally, one reference to a transaction equates to that transaction needing one part. 
       * Therefore, we must add the transaction number to an array "quantity" number of times.
       */
      for (let i = 0; i < quantity; i++) {
        transactions.push(transaction_id);
      }
    }
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
