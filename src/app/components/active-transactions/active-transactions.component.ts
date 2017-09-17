import { Component, OnInit } from '@angular/core';
import {Transaction} from "../../models/transaction";
import {TransactionService} from "../../services/transaction.service";

@Component({
  selector: 'app-active-transactions',
  templateUrl: 'active-transactions.component.html',
  styleUrls: ['active-transactions.component.css']
})
export class ActiveTransactionsComponent implements OnInit {
  transactions: Transaction[];
  loading: boolean = true;

  constructor(private transactionService: TransactionService) { }

  ngOnInit(): void {
    this.transactionService.getActiveTransactions()
      .then(transactions => {
        this.transactions = transactions;
        this.loading = false;
      })
  }

  getTimeDifference(transaction: Transaction): number {
    let created = Date.parse(transaction.date_created);
    let diff = Date.now() - created;
    return Math.floor(diff / 1000 / 60 / 60 / 24);
  }

  getBikeList(transaction: Transaction): string[] {
    return transaction.bikes.map((b) => {
      return `${b.make} ${b.model}`;
    });
  }
}
