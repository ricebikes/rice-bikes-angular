import { Component, OnInit } from '@angular/core';
import {Transaction} from "../../models/transaction";
import {TransactionService} from "../../services/transaction.service";
import {TransactionsComponent} from "../transactions/transactions.component";

@Component({
  selector: 'app-completed-transactions',
  templateUrl: 'completed-transactions.component.html',
  styleUrls: ['completed-transactions.component.css']
})
export class CompletedTransactionsComponent extends TransactionsComponent implements OnInit {
  transactions: Transaction[];
  loading: boolean = true;

  constructor(public transactionService: TransactionService) {
    super(transactionService);
  }

  ngOnInit(): void {
    this.transactionService.getCompletedTransactions()
      .then(transactions => {
        this.transactions = transactions;
        this.loading = false;
      })
  }

  getTimeDifference(transaction: Transaction): number {
    let created = Date.parse(transaction.date_completed);
    let diff = Date.now() - created;
    return Math.floor(diff / 1000 / 60 / 60 / 24);
  }
}

