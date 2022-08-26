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
  filteredTransactions: Transaction[];
  loading = true;

  objectKeys = Object.keys
  // objects mapping from values to booleans
  modelFilters = {};
  sizeFilters = {};
  colorFilters = {};
  statusFilters = {
    ordered: true,
    arrived: true,
    building: true,
    built: true,
    'for sale': true
  }


  constructor(public transactionService: TransactionService) { }

  currentTab = 'active';

  ngOnInit(): void {
    this.setTab(this.currentTab, { 
      complete: false, 
      refurb: false ,
      $or: [ //only show retrospecs w/ "building" status on active tab
        {transaction_type : {$ne: 'retrospec'} },
        {status: 'building'}
      ]
    });
  }


  // decription = "${size} / ${color}""
  parseRetrospec(bike) {
    const [size, color] = bike.description.split(" / ")
    return {
      size: size.toLowerCase(),
      color: color.toLowerCase(),
      model: bike.model.toLowerCase()
    }
  }

  /**
   * Used for filtering on Retrospec tab
   * Populates filters for all found models, sizes and colors 
   * for currently available retrospecs
   */
  initializeFilters() {
    if (this.currentTab !== "retrospec") {
      this.modelFilters = {}
      this.sizeFilters = {}
      this.colorFilters = {}
    } else {
      this.transactions.forEach(tx => {
        tx.bikes.forEach(bike => {
          const { model, size, color } = this.parseRetrospec(bike)
          this.modelFilters[model] = true
          this.sizeFilters[size] = true
          this.colorFilters[color] = true
        })
      })
    }
  }

  /**
   * Check to see if a transaction is filtered
   * Only filters on retrospec tab
   * @param transaction 
   */
  isTransactionDisplayed(transaction: Transaction) {
    if (this.currentTab != 'retrospec') return true
    return transaction.bikes.filter(bike => {
      const { model, size, color } = this.parseRetrospec(bike)
      return this.modelFilters[model] &&
        this.sizeFilters[size] &&
        this.colorFilters[color] &&
        (
          !transaction.status || 
          this.statusFilters[transaction.status]
        )
    }).length >0
  }

  /**
   * Filter transactions on retrospec tab
   */
  filterTransactions() {
    this.filteredTransactions = this.transactions.filter(this.isTransactionDisplayed.bind(this))
  }

  /**
   * Triggered by filter checkbox click
   * @param filtersObj one of modelFilters, colorFilters, sizeFilters
   * @param filter a key in filtersObj
   */
  toggleFilter(filtersObj, filter) {
    filtersObj[filter] = !filtersObj[filter]
    this.filterTransactions()
  }


  isGroupChecked(filtersGroup) {
    const filters = Object.keys(filtersGroup)
    const checked = filters.filter(filter => filtersGroup[filter])
    return checked.length >0
  }

  toggleFilterGroup(filtersGroup) {
    const filters = Object.keys(filtersGroup)
    if (this.isGroupChecked(filtersGroup)) {
      filters.forEach(filter => {
        filtersGroup[filter] = false
      })
    } else {
      filters.forEach(filter => {
        filtersGroup[filter] = true
      })
    }
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
        this.initializeFilters()
        this.filterTransactions()
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
