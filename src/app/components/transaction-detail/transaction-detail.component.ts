import {Component, OnInit, OnDestroy} from '@angular/core';
import { TransactionService } from "../../services/transaction.service";
import { Transaction } from "../../models/transaction";
import {ActivatedRoute, Router} from "@angular/router";
import {FormGroup, Validators, FormControl} from "@angular/forms";
import {Bike} from "../../models/bike";
import {Repair} from "../../models/repair";

@Component({
  selector: 'app-transaction-detail',
  templateUrl: 'transaction-detail.component.html',
  styleUrls: ['transaction-detail.component.css'],
  providers: [TransactionService]
})
export class TransactionDetailComponent implements OnInit {

  transaction: Transaction;
  bikeForm: FormGroup;
  editingTransaction: boolean = false;

  loading: boolean = true;

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

    this.route.params.subscribe(params => this.transactionService.getTransaction(params['_id']));
    this.transactionService.transaction.subscribe(transaction => {
      this.transaction = transaction;
      this.loading = false;
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
      this.router.navigate(['transactions/']);
    });
  }

  completeRepair(repair_id: string): void {
    let repairIdx = this.transaction.repairs.findIndex(rep => rep._id === repair_id);
    this.transaction.repairs[repairIdx].completed = !this.transaction.repairs[repairIdx].completed;
    this.updateTransaction();
  }

  deleteRepair(repair_id: string): void {
    this.transactionService.deleteRepairFromTransaction(this.transaction._id, repair_id);
  }

  deleteItem(item_id: string): void {
    this.transactionService.deleteItemFromTransaction(this.transaction._id, item_id);
  }

  get allRepairsComplete(): boolean {
    for (let repair of this.transaction.repairs) {
      if (!repair.completed) {
        return false;
      }
    }
    return true;
  }

  completeTransaction(): void {
    this.transaction.completed = true;
    this.updateTransaction();
  }

  getTotal(): number {
    var total = 0;
    this.transaction.items.forEach(item => total += item.price);
    this.transaction.repairs.forEach(rep => total += rep.repair.price);
    return total;
  }

  emailCustomer(): void {
    window.open(`mailto:${this.transaction.customer.email}?Subject=Your%20bike`, "Email customer");
  }
}
