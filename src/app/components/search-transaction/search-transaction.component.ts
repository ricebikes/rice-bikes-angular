import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Transaction } from '../../models/transaction';
import { SearchService } from '../../services/search.service';

@Component({
  selector: 'app-search-transaction',
  templateUrl: 'search-transaction.component.html',
  styleUrls: ['search-transaction.component.css']
})
export class SearchTransactionComponent implements OnInit {

  @Output() foundTransactions = new EventEmitter<Transaction[]>();

  searchChoices: string[] = ['Customer', 'Bike', 'Description'];
  currentChoice: string = this.searchChoices[0];

  searchForm = this.fb.group({
    search: ['', Validators.required]
  });

  constructor(private fb: FormBuilder, private searchService: SearchService) { }

  ngOnInit() {
  }

  setSearchChoice(choice: string): void {
    this.currentChoice = choice;
    this.searchForm.reset();
  }

  /**
   * Searches for transactions, based on the current choice that is set.
   */
  submitSearch() {
    switch (this.currentChoice) {
      case 'Customer':
        this.searchService.customerSearch(this.searchForm.get('search').value)
          .subscribe(customers =>
            // Search for transactions
            this.searchService.transactionSearch(customers, null, null).then(res => this.foundTransactions.emit(res))
          )
        break;
      case 'Bike':
        this.searchService.bikeSearch(this.searchForm.get('search').value)
          .then(bikes =>
            this.searchService.transactionSearch(null, bikes, null).then(res => this.foundTransactions.emit(res))
          )
        break;
      case 'Description':
        this.searchService.transactionSearch(null, null, this.searchForm.get('search').value)
          .then(res => this.foundTransactions.emit(res));
        break;
      default:
        break;
    }
  }
}
