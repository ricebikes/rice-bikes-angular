import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Customer } from '../../models/customer';
import { SearchService } from '../../services/search.service';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-search-customer',
  templateUrl: './search-customer.component.html',
  styleUrls: ['./search-customer.component.css', '../../app.component.css']
})
export class SearchCustomerComponent implements OnInit {
  @Input("type") type: string;
  
  @Output() foundCustomer = new EventEmitter<Customer>();

  customerResults: Observable<Customer[]>;
  private searchTerms = new Subject<string>();

  customer: Customer = new Customer();
  customerForm: FormGroup;

  constructor(
    private searchService: SearchService
  ) { }

  ngOnInit() {
    this.customerForm = new FormGroup({
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
      'phone': new FormControl(this.customer.phone, [
        Validators.pattern(/^\d{10}$/)
      ]),
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
      });
  }

  search(term: string): void {
    this.searchTerms.next(term);
  }

  setCustomer(customer: Customer): void {
    this.customer = customer;
    this.customerForm.setValue(
      {
        email: this.customer.email,
        first_name: this.customer.first_name,
        last_name: this.customer.last_name,
        phone: this.customer.phone || '',
      }
    );
    this.searchTerms.next('');
  }

  submitCustomer(): void {
    // create customer if does not exist
    if (!this.customer._id) {
      this.customer = new Customer();
      this.customer.email = this.customerForm.value['email'];
      this.customer.first_name = this.customerForm.value['first_name'];
      this.customer.last_name = this.customerForm.value['last_name'];
    }
    this.customer.phone = this.customerForm.value['phone'];

    // send customer to embedding context
    this.foundCustomer.emit(this.customer);
  }


}