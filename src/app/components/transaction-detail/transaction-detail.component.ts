import {Component, OnInit, OnDestroy} from '@angular/core';
import { TransactionService } from "../../services/transaction.service";
import { Transaction } from "../../models/transaction";
import { ActivatedRoute } from "@angular/router";

@Component({
  selector: 'app-transaction-detail',
  templateUrl: 'transaction-detail.component.html',
  styleUrls: ['transaction-detail.component.css'],
  providers: [TransactionService]
})
export class TransactionDetailComponent implements OnInit {

  transaction: Transaction;
  loading: boolean = true;

  constructor(
    private transactionService: TransactionService,
    private route: ActivatedRoute,
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => this.transactionService.getTransaction(params['id']));
    this.transactionService.transaction.subscribe(transaction => {
      this.transaction = transaction;
      this.loading = false;
    });
  }
}
