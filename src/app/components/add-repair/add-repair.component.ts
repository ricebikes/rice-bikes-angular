import {Component, OnInit, Input} from '@angular/core';
import {Subject, Observable} from "rxjs";
import {SearchService} from "../../services/search.service";
import {Repair} from "../../models/repair";
import {Transaction} from "../../models/transaction";
import {TransactionService} from "../../services/transaction.service";

@Component({
  selector: 'app-add-repair',
  templateUrl: 'add-repair.component.html',
  styleUrls: ['add-repair.component.css']
})
export class AddRepairComponent implements OnInit {
  @Input() transaction: Transaction;

  searchFieldValue: string;
  repairResults: Observable<Repair[]>;
  private searchTerms = new Subject<string>();

  constructor(
    private searchService: SearchService,
    private transactionService: TransactionService
  ) { }

  ngOnInit() {
    this.repairResults = this.searchTerms
      .debounceTime(300)
      .distinctUntilChanged()
      .switchMap(term => term
        ? this.searchService.repairSearch(term)
        : Observable.of<Repair[]>([]))
      .catch(err => {
        console.log(err);
        return Observable.of<Repair[]>([]);
      })
  }

  search(term: string): void {
    this.searchTerms.next(term);
  }

  addRepair(repair: Repair): void {
    this.transactionService.addRepairToTransaction(this.transaction._id, repair._id)
      .then(() => {
        this.searchTerms.next('');
        this.searchFieldValue = '';
      });
  }

}
