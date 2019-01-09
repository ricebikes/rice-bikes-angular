import {Component, OnInit, Input} from '@angular/core';
import {Subject, Observable} from "rxjs";
import {SearchService} from "../../services/search.service";
import {RepairItem} from "../../models/repairItem";
import {Transaction} from "../../models/transaction";
import {TransactionService} from "../../services/transaction.service";

@Component({
  selector: 'app-add-repair',
  templateUrl: 'add-repair.component.html',
  styleUrls: ['add-repair.component.css', '../../app.component.css']
})
export class AddRepairComponent implements OnInit {
  @Input() transaction: Transaction;

  searchFieldValue: string;
  repairResults: Observable<RepairItem[]>;
  private searchTerms = new Subject<string>();

  constructor(
    private searchService: SearchService,
    private transactionService: TransactionService
  ) { }

  ngOnInit() {
    this.repairResults = this.searchTerms
      .debounceTime(100)
      .distinctUntilChanged()
      .switchMap(term => {
        return term ? this.searchService.repairSearch(term) : Observable.of<RepairItem[]>([]);
      })
      .catch(err => {
        console.log(err);
        return Observable.of<RepairItem[]>([]);
      });
  }

  search(term: string): void {
    this.searchTerms.next(term);
  }

  addRepair(repair: any): void {
    this.transactionService.addRepairToTransaction(this.transaction._id, repair._id)
      .then(() => {
        this.searchTerms.next('');
        this.searchFieldValue = '';
      });
  }

}
