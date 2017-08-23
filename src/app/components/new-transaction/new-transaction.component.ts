import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {TransactionService} from "../../services/transaction.service";
import {Customer} from "../../models/customer";
import {SearchService} from "../../services/search.service";
import {Observable, Subject} from "rxjs";

@Component({
  selector: 'app-new-transaction',
  templateUrl: './new-transaction.component.html',
  styleUrls: ['./new-transaction.component.css'],
  providers: [SearchService]
})
export class NewTransactionComponent implements OnInit {

  customerResults: Observable<Customer[]>;
  private searchTerms = new Subject<string>();

  customer: Customer = new Customer();

  private email: string;
  private firstName: string;
  private lastName: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private transactionService: TransactionService,
    private searchService: SearchService
  ) { }

  ngOnInit() {
    this.customerResults = this.searchTerms
      .debounceTime(300)
      .distinctUntilChanged()
      .switchMap(term => term
        ? this.searchService.customerSearch('email', term)
        : Observable.of<Customer[]>([]))
      .catch(err => {
        console.log(err);
        return Observable.of<Customer[]>([]);
      })


  }

  search(term: string): void {
    this.searchTerms.next(term);
  }

  createTransaction(): void {
    if (this.email && this.firstName && this.lastName) {

    }
  }
}
