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

  constructor(public transactionService: TransactionService) { }

  currentTab: string = 'active';
  ngOnInit(): void {
    this.getActiveTransactions();
  }

  getTransactions(): void {
    this.transactionService.getTransactions()
      .then(transactions => {
        this.transactions = transactions;
        this.loading = false;
        this.currentTab = 'all';
      });
  }

  getWaitingOnPickup(): void {
    this.currentTab = 'pickup';
  }

  getWaitingOnPart(): void {
    this.currentTab = 'part';
  }

  getPaid(): void {
    this.currentTab = 'paid';
  }

  getActiveTransactions(): void {
    this.transactionService.getActiveTransactions()
      .then(transactions => {
        this.transactions = transactions;
        this.loading = false;
        this.currentTab = 'active';
      })
  }

  getPastTransactions(): void {
    this.transactionService.getCompletedTransactions()
      .then(transactions => {
        this.transactions = transactions;
        this.currentTab = 'completed';
      })
  }

  getTimeDifference(transaction: Transaction): number {
    let created = Date.now();
    if (this.currentTab === 'active') {
      created = Date.parse(transaction.date_created);
    } else if (this.currentTab === 'completed') {
      created = Date.parse(transaction.date_completed)
    }
    let diff = Date.now() - created;
    return Math.floor(diff / 1000 / 60 / 60 / 24);
  }

  getBikeList(transaction: Transaction): string[] {
    return transaction.bikes.map((b) => {
      return `${b.make} ${b.model}`;
    });
  }
}
