import {Component, OnInit, ViewChild, ElementRef} from '@angular/core';
import { TransactionService } from "../../../services/transaction.service";
import { Transaction } from "../../../models/transaction";
import {ActivatedRoute, Router} from "@angular/router";
import {FormGroup, Validators, FormControl} from "@angular/forms";
import {Bike} from "../../../models/bike";

@Component({
  selector: 'app-transaction-detail',
  templateUrl: 'transaction-detail.component.html',
  styleUrls: ['transaction-detail.component.css'],
  providers: [TransactionService]
})
export class TransactionDetailComponent implements OnInit {

  @ViewChild('deleteTransactionModal') deleteTransactionModal: ElementRef;

  transaction: Transaction;
  bikeForm: FormGroup;
  editingTransaction: boolean = false;

  loading: boolean = true;
  emailLoading: boolean = false;
  displayDescription: string;
  priceEdit: boolean = false;

  constructor(
    private transactionService: TransactionService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit() {
    this.bikeForm = new FormGroup({
      'bike-make': new FormControl("", [
        Validators.required
      ]),
      'bike-model': new FormControl("", [
        Validators.required
      ]),
      'bike-desc': new FormControl("", [
        Validators.required
      ])
    });

    this.route.params.subscribe(params => {
      this.transactionService.getTransaction(params['_id'])
        .then(() => {
          this.transactionService.transaction.subscribe(trans => this.transaction = trans);
          this.loading = false;
          this.displayDescription = this.transaction.description.replace(/(\n)+/g, '<br />');
        })
    });
  }

  changeType(type: string): void {
    this.transaction.transaction_type = type;
    this.updateTransaction();
  }

  updateTransaction(): void {
    this.transactionService.updateTransaction(this.transaction);
  }

  addBike(): void {
    let bike = new Bike();
    bike.make = this.bikeForm.value['bike-make'];
    bike.model = this.bikeForm.value['bike-model'];
    bike.description = this.bikeForm.value['bike-desc'];
    this.transactionService.addNewBikeToTransaction(this.transaction._id, bike) ;
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

  get canComplete(): boolean {
    if (this.transaction.waiting_part) return false;
    for (const repair of this.transaction.repairs) {
      if (!repair.completed) {
        return false;
      }
    }
    return true;
  }

  completeTransaction(): void {
    this.emailLoading = true;
    this.transactionService.notifyCustomerEmail(this.transaction._id)
      .then(() => {
        let date = Date.now().toString();
        this.emailLoading = false;
        this.transaction.complete = true;
        this.transaction.date_completed = date;
        this.transactionService.setComplete(this.transaction._id, this.transaction.complete);
      });
  }

  completeWithoutEmail(): void {
    const date = Date.now().toString();
    this.transaction.complete = true;
    this.transaction.date_completed = date;
    this.transactionService.setComplete(this.transaction._id, this.transaction.complete);
  }

  reopenTransaction(): void {
    this.transaction.complete = false;
    this.transactionService.setComplete(this.transaction._id, this.transaction.complete);
  }

  emailCustomer(): void {
    window.open(`mailto:${this.transaction.customer.email}?Subject=Your bike`, 'Email customer');
  }

  updateDescription(): void {
    this.editingTransaction = false;
    this.displayDescription = this.transaction.description.replace(/(\n)+/g, '<br />');
    this.transactionService.updateDescription(this.transaction._id, this.transaction.description);
  }

  toggleWaitOnPart(): void {
    this.transaction.waiting_part = !this.transaction.waiting_part;
    this.updateTransaction();
  }

  toggleWaitOnEmail(): void {
    this.transaction.waiting_email = !this.transaction.waiting_email;
    this.updateTransaction();
  }
  toggleRefurb(): void {
    this.transaction.refurb = !this.transaction.refurb;
    this.updateTransaction();
  }
  toggleUrgent(): void{
    this.transaction.urgent = !this.transaction.urgent;
    this.updateTransaction();
  }

}
