import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { TransactionService } from '../../../services/transaction.service';
import { Transaction } from '../../../models/transaction';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { Bike } from '../../../models/bike';
import { Item } from '../../../models/item';
import { Customer } from '../../../models/customer';
// import { AddItemComponent } from '../../add-item/add-item.component';
import { OrderRequestSelectorComponent } from '../../whiteboard/order-request-selector/order-request-selector.component';
import { OrderRequest } from '../../../models/orderRequest';
import { OrderRequestService } from '../../../services/order-request.service';
import { AnalyticsService } from '../../../services/analytics.service';

@Component({
  selector: 'app-transaction-detail',
  templateUrl: 'transaction-detail.component.html',
  styleUrls: ['transaction-detail.component.css', '../../../app.component.css'],
  providers: [TransactionService]
})
export class TransactionDetailComponent implements OnInit {

  @ViewChild('updateCustomerModal') updateCustomerModal: ElementRef;
  @ViewChild('deleteTransactionModal') deleteTransactionModal: ElementRef;
  @ViewChild('customPriceModalTrigger') customPriceModalButtonTrigger: ElementRef;
  @ViewChild('completeDropdown') completeDropdownButton: ElementRef;
//   @ViewChild('addItemComponent') addItemComponent: AddItemComponent;
  @ViewChild('orderRequestSelector') orderRequestSelectorComponent: OrderRequestSelectorComponent;

  transaction: Transaction;
  bikeForm: FormGroup;
  customPriceForm = new FormGroup({
    'price': new FormControl('', [Validators.required])
  });
  editingTransaction = false;
  stagedUsedItem: Item; // Used to stage a used item while user sets price

  loading = true;
  emailLoading = false;
  displayDescription: string;
  priceEdit = false;

  constructor(
    private transactionService: TransactionService,
    private orderRequestService: OrderRequestService,
    private analyticsService: AnalyticsService,
    private route: ActivatedRoute,
    private router: Router,
  ) { }

  ngOnInit() {
    this.bikeForm = new FormGroup({
      'bike-make': new FormControl('', [
        Validators.required
      ]),
      'bike-model': new FormControl('', [
        Validators.required
      ]),
      'bike-desc': new FormControl('', [
        Validators.required
      ])
    });

    this.route.params.subscribe(params => {
      this.transactionService.getTransaction(params['_id'])
        .then(() => {
          this.transactionService.transaction.subscribe(trans => {
            this.transaction = trans;
            if (this.transaction.description) {
              this.displayDescription = this.transaction.description.replace(/(\n)+/g, '<br />');
            }
          });
          this.loading = false;
          if (this.transaction.description) {
            this.displayDescription = this.transaction.description.replace(/(\n)+/g, '<br />');
          }
        });
    });
  }

  changeType(type: string): void {
    this.transaction.transaction_type = type;
    this.updateTransaction();
  }

  changeStatus(status: string): void {
    this.transactionService.updateStatus(this.transaction._id, status).then(res => {
      this.analyticsService.notifyTransactionStatusChange(this.transaction._id);
    })
  }

  /**
   * Mark for sale has seperate function from other statuses as it required admin
   */
  markForSale() {
    this.transactionService.markForSale(this.transaction._id).then(res => {
      this.analyticsService.notifyTransactionStatusChange(this.transaction._id);
    })
  }

  // only intended to be used for Retrospec transaction
  async updateCustomer(customer: Customer) {
    await this.transactionService.updateCustomer(this.transaction._id, customer)
    this.transaction.customer = customer
    this.updateCustomerModal.nativeElement.click()
  }

  updateTransaction(): void {
    this.transactionService.updateTransaction(this.transaction);
  }

//   triggerItemSearch() {
//     this.addItemComponent.triggerItemSearch();
//   }

//   triggerScanModal() {
//     this.addItemComponent.triggerScanModal();
//   }

  addBike(): void {
    const bike = new Bike();
    bike.make = this.bikeForm.value['bike-make'];
    bike.model = this.bikeForm.value['bike-model'];
    bike.description = this.bikeForm.value['bike-desc'];
    this.transactionService.addNewBikeToTransaction(this.transaction._id, bike);
  }

  deleteBike(bike: Bike): void {
    this.transactionService.deleteBikeFromTransaction(this.transaction._id, bike._id);
  }

  deleteTransaction(): void {
    this.transactionService.deleteTransaction(this.transaction._id).then(() => {
      this.deleteTransactionModal.nativeElement.click();
      this.router.navigate(['transactions/']);
    });
  }

  toggleCompleteRepair(repair_id: string): void {
    const repairIdx = this.transaction.repairs.findIndex(rep => rep._id === repair_id);
    this.transaction.repairs[repairIdx].completed = !this.transaction.repairs[repairIdx].completed;
    this.transactionService.updateRepair(this.transaction._id, repair_id, this.transaction.repairs[repairIdx].completed);
  }

  deleteRepair(repair_id: string): void {
    this.transactionService.deleteRepairFromTransaction(this.transaction._id, repair_id);
  }

  deleteItem(item_id: string): void {
    this.transactionService.deleteItemFromTransaction(this.transaction._id, item_id);
  }

  addItem(item: Item) {
    // if (item.condition == 'Used') {
    //   // Prompt user to set custom price.
    //   let suggestedPrice = this.transaction.employee ? item.wholesale_cost : item.standard_price;
    //   this.customPriceForm.controls['price'].setValue(suggestedPrice);
    //   this.stagedUsedItem = item;
    //   this.customPriceModalButtonTrigger.nativeElement.click();
    // } 
    // else {
    this.transactionService.addItemToTransaction(this.transaction._id, item._id);
    // }
  }

  addUsedItem() {
    // Get the price and the item to add from the custom price form and the stagedUsedItem variable
    const price = parseFloat(this.customPriceForm.controls['price'].value);
    const item = this.stagedUsedItem;
    // Add used item then dismiss modal
    this.transactionService.addItemToTransaction(this.transaction._id,
      item._id, price).then(res => this.customPriceModalButtonTrigger.nativeElement.click())
  }

  get canComplete(): boolean {
    if (!this.transaction) {
      return false;
    }
    if (this.transaction.orderRequests.length > 0) {
      return false;
    }
    if (this.transaction.transaction_type == 'retrospec' && this.transaction.status != 'for sale'){
      return false
    }
    for (const repair of this.transaction.repairs) {
      if (!repair.completed) {
        return false;
      }
    }
    return true;
  }

  completeTransaction(): void {
    this.emailLoading = true;
    this.completeDropdownButton.nativeElement.click(); // To close dropdown
    this.transactionService.notifyCustomerEmail(this.transaction._id)
      .then(() => {
        const date = Date.now().toString();
        this.emailLoading = false;
        this.transaction.complete = true;
        this.transaction.date_completed = date;
        this.transactionService.setComplete(this.transaction._id, this.transaction.complete).then(res => {
          this.analyticsService.notifyTransactionStatusChange(this.transaction._id);
        });
      });
  }

  completeWithoutEmail(): void {
    const date = Date.now().toString();
    this.completeDropdownButton.nativeElement.click(); // To close dropdown
    this.emailLoading = true; // just switches HTML in dom so that the dropdown box vanishes
    this.transaction.complete = true;
    this.transaction.date_completed = date;
    this.transactionService.setComplete(this.transaction._id, this.transaction.complete).then(res => {
      this.analyticsService.notifyTransactionStatusChange(this.transaction._id);
    });
    this.emailLoading = false;
  }

  reopenTransaction(): void {
    this.transaction.complete = false;
    this.transactionService.setComplete(this.transaction._id, this.transaction.complete).then(res => {
      this.analyticsService.notifyTransactionStatusChange(this.transaction._id);
    })
  }

  emailCustomer(): void {
    window.open(`mailto:${this.transaction.customer.email}?Subject=Your bike`, 'Email customer');
  }

  updateDescription(): void {
    this.editingTransaction = false;
    this.displayDescription = this.transaction.description.replace(/(\n)+/g, '<br />');
    this.transactionService.updateDescription(this.transaction._id, this.transaction.description);
  }

  toggleWaitOnEmail(): void {
    this.transaction.waiting_email = !this.transaction.waiting_email;
    this.updateTransaction();
  }
  toggleRefurb(): void {
    this.transaction.refurb = !this.transaction.refurb;
    this.updateTransaction();
  }
  toggleBeerbike(): void {
      this.transactionService.setBeerBike(this.transaction._id, !this.transaction.beerbike);
  }
  toggleUrgent(): void {
    this.transaction.urgent = !this.transaction.urgent;
    this.updateTransaction();
  }

  /**
   * Sets order request transaction will be waiting on to arrive
   * @param req Order Request Transaction will wait on
   */
  addOrderRequest(req: OrderRequest) {
    // The order request selection component will handle adding the request to transaction. Just pull new transaction from backend.
    this.transactionService.getTransaction(this.transaction._id);
  }

  /**
   * Removes an order request from a transaction
   * @param req Order Request to remove from transaction
   */
  removeOrderRequest(req: OrderRequest) {
    this.orderRequestService.removeTransaction(req, this.transaction._id).then(res => {
      // Get new copy of transaction from backend
      this.transactionService.getTransaction(this.transaction._id);
    });
  }

}
