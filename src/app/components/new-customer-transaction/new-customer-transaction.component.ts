import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {TransactionService} from '../../services/transaction.service';
import {Customer} from '../../models/customer';

@Component({
  selector: 'app-new-customer-transaction',
  templateUrl: './new-customer-transaction.component.html',
  styleUrls: ['./new-customer-transaction.component.css', '../../app.component.css']
})
export class NewCustomerTransactionComponent implements OnInit {

  type: string; // transaction type

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private transactionService: TransactionService,
  ) {}

  ngOnInit() {
    this.type = this.route.snapshot.queryParamMap.get('t')
  }

  submitTransaction(customer: Customer): void {
    this.transactionService.createTransaction(this.type, customer)
        .then(trans => this.router.navigate(['/transactions', trans._id]));
  }
}
