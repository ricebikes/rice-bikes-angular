import { Component, OnInit } from '@angular/core';
import { TransactionService } from '../../services/transaction.service';
import { Transaction } from '../../models/transaction';

@Component({
  selector: 'app-transactions',
  templateUrl: 'transactions.component.html',
  styleUrls: ['transactions.component.css', '../../app.component.css'],
  providers: [TransactionService]
})
export class TransactionsComponent implements OnInit {
  transactions: Transaction[];
  loading = true;

  constructor(public transactionService: TransactionService) { }

  currentTab = 'active';

  ngOnInit(): void {
    this.setTab(this.currentTab, { complete: false, refurb: false });
  }

  /**
   * Sets the current tab to the given string. Accepts optional props to request the backend with.
   * @param {string} tab
   * @param {Object} props
   */
  setTab(tab: string, props?: Object): void {
    this.currentTab = tab;
    if (tab == 'search') {
      /**
       * This tab does not use the 'props' parameter. It allows users to search for transactions
       * we don't need to take action here beyond setting the current tab, the search widget will handle finding transactions
       */
      this.loading = true;
      return;
    }
    this.loading = true;
    this.transactionService.getTransactions(props)
      .then(transactions => {
        this.transactions = transactions;
        this.loading = false;
      });
  }

  setTransactions(transactions: Transaction[]) {
    this.transactions = transactions;
    this.loading = false;
  }

  getTimeDifference(transaction: Transaction): number {
    let created = Date.now();
    if (this.currentTab === 'active') {
      created = Date.parse(transaction.date_created);
    } else if (this.currentTab === 'completed') {
      created = Date.parse(transaction.date_completed);
    }
    const diff = Date.now() - created;
    return Math.floor(diff / 1000 / 60 / 60 / 24);
  }

  getBikeList(transaction: Transaction): string[] {
    return transaction.bikes.map((b) => {
      if (transaction.transaction_type == 'retrospec') {
        return `${b.model} / ${b.description}`
      } else {
        return `${b.make} ${b.model}`
      }
    });
  }
}
