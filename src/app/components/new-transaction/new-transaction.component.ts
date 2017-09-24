import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {TransactionService} from "../../services/transaction.service";
import {Customer} from "../../models/customer";
import {SearchService} from "../../services/search.service";
import {Observable, Subject} from "rxjs";
import {FormGroup, FormControl, Validators} from "@angular/forms";

@Component({
  selector: 'app-new-transaction',
  templateUrl: './new-transaction.component.html',
  styleUrls: ['./new-transaction.component.css', '../../app.component.css']
})
export class NewTransactionComponent implements OnInit {

  customerResults: Observable<Customer[]>;
  private searchTerms = new Subject<string>();

  customer: Customer = new Customer();
  transactionForm: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private transactionService: TransactionService,
    private searchService: SearchService
  ) {}

  ngOnInit() {

    this.transactionForm = new FormGroup({
      email: new FormControl(this.customer.email, [
        Validators.required,
        Validators.email
      ]),
      'first_name': new FormControl(this.customer.first_name, [
        Validators.required
      ]),
      'last_name': new FormControl(this.customer.last_name, [
        Validators.required
      ])
    });

    this.customerResults = this.searchTerms
      .debounceTime(300)
      .distinctUntilChanged()
      .switchMap(term => term
        ? this.searchService.customerSearch(term)
        : Observable.of<Customer[]>([]))
      .catch(err => {
        console.log(err);
        return Observable.of<Customer[]>([]);
      })
  }

  search(term: string): void {
    this.searchTerms.next(term);
  }

  setCustomer(customer: Customer): void {
    this.customer = customer;
    this.transactionForm.setValue(
      {
        email: this.customer.email,
        first_name: this.customer.first_name,
        last_name: this.customer.last_name
      }
    );
    this.searchTerms.next('');
  }

  submitTransaction(): void {
    this.route.queryParams.subscribe(params => {
      if (this.customer._id) {
        this.transactionService.createTransactionCustomerExists(params['t'], this.customer._id)
          .then(trans => this.router.navigate(['/transactions', trans._id]));
      } else {
        let cust = new Customer();
        cust.email = this.transactionForm.value['email'];
        cust.first_name = this.transactionForm.value['first_name'];
        cust.last_name = this.transactionForm.value['last_name'];
        this.transactionService.createTransaction(params['t'], cust)
          .then(trans => {
            this.router.navigate(['/transactions', trans._id])
          });
      }
    })
  }
}
