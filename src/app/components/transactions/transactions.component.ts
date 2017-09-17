import { Component, OnInit } from '@angular/core';
import { TransactionService } from "../../services/transaction.service";
import { Transaction } from "../../models/transaction";

@Component({
  selector: 'app-transactions',
  templateUrl: 'transactions.component.html',
  styleUrls: ['transactions.component.css'],
  providers: [TransactionService]
})
export class TransactionsComponent implements OnInit {
  transactions: Transaction[];
  loading: boolean = true;

  constructor(private transactionService: TransactionService) { }

  ngOnInit(): void {
    this.transactionService.getTransactions()
      .then(transactions => {
        this.transactions = transactions;
        this.loading = false;
      })
  }

  getBikeList(transaction: Transaction): string[] {
    return transaction.bikes.map((b) => {
      return `${b.make} ${b.model}`;
    });
  }
}
