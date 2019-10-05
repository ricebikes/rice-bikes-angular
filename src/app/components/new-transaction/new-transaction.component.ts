import {AfterViewInit, Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {TransactionService} from "../../services/transaction.service";
import {Customer} from "../../models/customer";
import {SearchService} from "../../services/search.service";
import {Observable, Subject} from "rxjs";
import {FormGroup, FormControl, Validators} from "@angular/forms";
import {e} from '@angular/core/src/render3';
import {AlertService} from '../../services/alert.service';
import {NgbTypeaheadSelectItemEvent} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-new-transaction',
  templateUrl: './new-transaction.component.html',
  styleUrls: ['./new-transaction.component.css', '../../app.component.css']
})
export class NewTransactionComponent implements OnInit {


  customer: Customer = new Customer();
  transactionForm: FormGroup;
  employee_name: String;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private transactionService: TransactionService,
    private searchService: SearchService,
    private alertService: AlertService
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
      ]),
      'employee_name': new FormControl(this.employee_name)
    });
  }

  // function used to search for customer by input
  customer_search = (text: Observable<string>) =>
    text
      .debounceTime(300)
      .distinctUntilChanged()
      .switchMap(search => search
        ? this.searchService.customerSearch(search)
        : [])
      .catch (error => {
        this.alertService.queueAlert(error);
        return Observable.of([]);
      })

  // formatter for customer results
  formatter = (cust: Customer) => cust.email;
  // formatter for customer results in list
  result_formatter = (cust: Customer) => `${cust.email} - ${cust.first_name} ${cust.last_name}` ;

  customer_selected(event: NgbTypeaheadSelectItemEvent): void {
      this.setCustomer(event.item);
  }

  setCustomer(customer: Customer): void {
    this.customer = customer;
    this.transactionForm.setValue(
      {
        email: this.customer.email,
        first_name: this.customer.first_name,
        last_name: this.customer.last_name,
        employee_name: null,
      }
    );
  }

  submitTransaction(): void {
    this.route.queryParams.subscribe(params => {
      if (this.customer._id) {
        this.transactionService.createTransactionCustomerExists(params['t'], this.customer._id, null)
          .subscribe(trans => this.router.navigate(['/transactions', trans._id]));
      } else {
        const cust = new Customer();
        cust.email = this.transactionForm.value['email'];
        cust.first_name = this.transactionForm.value['first_name'];
        cust.last_name = this.transactionForm.value['last_name'];
        this.transactionService.createTransaction(params['t'], cust, null)
          .subscribe(trans => {
            this.router.navigate(['/transactions', trans._id])
          });
      }
    })
  }
}
