import {Component, OnInit, Input} from '@angular/core';
import {Subject, Observable} from "rxjs";
import {SearchService} from "../../services/search.service";
import {Item} from "../../models/item";
import {Transaction} from "../../models/transaction";
import {TransactionService} from "../../services/transaction.service";

@Component({
  selector: 'app-add-item',
  templateUrl: 'add-item.component.html',
  styleUrls: ['add-item.component.css']
})
export class AddItemComponent implements OnInit {
  @Input() transaction: Transaction;

  searchFieldValue: string;
  itemResults: Observable<Item[]>;
  private searchTerms = new Subject<string>();

  constructor(
    private searchService: SearchService,
    private transactionService: TransactionService
  ) { }

  ngOnInit() {
    this.itemResults = this.searchTerms
      .debounceTime(300)
      .distinctUntilChanged()
      .switchMap(term => term
        ? this.searchService.itemSearch(term)
        : Observable.of<Item[]>([]))
      .catch(err => {
        console.log(err);
        return Observable.of<Item[]>([]);
      })
  }

  search(term: string): void {
    this.searchTerms.next(term);
  }

  addItem(item: Item): void {
    this.transactionService.addObjectToTransaction(this.transaction.id, 'items', item.id)
      .then(() => {
        this.searchTerms.next('');
        this.searchFieldValue = '';
      })
  }

}
