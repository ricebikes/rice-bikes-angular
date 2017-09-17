import { Component, OnInit } from '@angular/core';
import {Transaction} from "../../models/transaction";
import {TransactionService} from "../../services/transaction.service";
import {TransactionsComponent} from "../transactions/transactions.component";

@Component({
  selector: 'app-active-transactions',
  templateUrl: 'active-transactions.component.html',
  styleUrls: ['active-transactions.component.css']
})
export class ActiveTransactionsComponent extends TransactionsComponent implements OnInit {
  transactions: Transaction[];
  loading: boolean = true;

  constructor(public transactionService: TransactionService) {
    super(transactionService);
  }

  ngOnInit(): void {
    this.transactionService.getActiveTransactions()
      .then(transactions => {
        this.transactions = transactions;
        this.loading = false;
      })
  }
}
