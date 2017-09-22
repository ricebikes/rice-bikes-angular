import {Component, OnInit, OnDestroy} from '@angular/core';
import { TransactionService } from "../../services/transaction.service";
import { Transaction } from "../../models/transaction";
import {ActivatedRoute, Router} from "@angular/router";
import {FormGroup, Validators, FormControl} from "@angular/forms";
import {Bike} from "../../models/bike";

@Component({
  selector: 'app-transaction-detail',
  templateUrl: 'transaction-detail.component.html',
  styleUrls: ['transaction-detail.component.css'],
  providers: [TransactionService]
})
export class TransactionDetailComponent implements OnInit {

  transaction: Transaction;
  loading: boolean = true;
  bikeForm: FormGroup;

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
}
