import {Component, OnInit, ViewChild, ElementRef} from '@angular/core';
import { TransactionService } from "../../../services/transaction.service";
import { Transaction } from "../../../models/transaction";
import {ActivatedRoute, Router} from "@angular/router";
import {FormGroup, Validators, FormControl} from "@angular/forms";
import {Bike} from "../../../models/bike";
import {AlertService} from '../../../services/alert.service';
import {Observable} from 'rxjs/Observable';
import {User} from '../../../models/user';

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
  alerts: Observable<String[]>;

  constructor(
    private transactionService: TransactionService,
    private route: ActivatedRoute,
    private router: Router,
    private alertService: AlertService,
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
        .subscribe((transaction: Transaction) => {
          this.transaction = transaction;
          this.loading = false;
          this.displayDescription = this.transaction.description.replace(/(\n)+/g, '<br />');
        });
    });
    this.alerts = this.alertService.subscribeToAlerts();
  }

  changeType(type: string): void {
    this.transaction.transaction_type = type;
    this.updateTransaction();
  }

  updateTransaction(): void {
    this.transactionService.updateTransaction(this.transaction);
  }

  addBike(): void {
    const bike = new Bike();
    bike.make = this.bikeForm.value['bike-make'];
    bike.model = this.bikeForm.value['bike-model'];
    bike.description = this.bikeForm.value['bike-desc'];
    this.transactionService.addNewBikeToTransaction(this.transaction._id, bike) ;
  }

  deleteBike(bike: Bike): void {
    this.transactionService.deleteBikeFromTransaction(this.transaction._id, bike._id);
  }

  deleteTransaction(): void {
    this.transactionService.deleteTransaction(this.transaction._id).subscribe( () => {
      this.deleteTransactionModal.nativeElement.click();
      this.router.navigate(['transactions/']);
    });
  }

  updateRepair(repair_id: string, user: User, completed: boolean): void {
    this.transactionService.updateRepairInTransaction(this.transaction._id, repair_id, user, completed)
      .subscribe((new_transaction) => this.transaction = new_transaction);
  }

  deleteRepair(repair_id: string, user: User): void {
    this.transactionService.deleteRepairFromTransaction(this.transaction._id, repair_id, user)
      .subscribe((new_transaction) => this.transaction = new_transaction);
  }

  deleteItem(item_id: string, user: User): void {
    this.transactionService.deleteItemFromTransaction(this.transaction._id, item_id, user)
      .subscribe((new_transaction) => this.transaction = new_transaction);
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

  completeTransaction(user: User): void {
    this.emailLoading = true;
    this.transactionService.notifyCustomerEmail(this.transaction._id)
      .subscribe(() => {
        const date = Date.now().toString();
        this.emailLoading = false;
        this.transaction.complete = true;
        this.transaction.date_completed = date;
        this.transactionService.updateTransactionComplete(this.transaction, user)
          .subscribe((new_transaction) => this.transaction = new_transaction);
      });
  }

  completeWithoutEmail(user: User): void {
    const date = Date.now().toString();
    this.transaction.complete = true;
    this.transaction.date_completed = date;
    this.transactionService.updateTransactionComplete(this.transaction, user)
      .subscribe((new_transaction) => this.transaction = new_transaction);
  }

  reopenTransaction(user: User): void {
    this.transaction.complete = false;
    this.transactionService.updateTransactionComplete(this.transaction, user)
      .subscribe((new_transaction) => this.transaction = new_transaction);
  }

  emailCustomer(): void {
    window.open(`mailto:${this.transaction.customer.email}?Subject=Your bike`, "Email customer");
  }

  updateDescription(user: User): void {
    this.editingTransaction = false;
    this.displayDescription = this.transaction.description.replace(/(\n)+/g, '<br />');
    this.transactionService.updateTransactionDescription(this.transaction, user).
      subscribe((new_transaction) => this.transaction = new_transaction);
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


}
