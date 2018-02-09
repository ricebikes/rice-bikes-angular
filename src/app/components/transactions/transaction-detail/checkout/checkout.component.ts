import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {TransactionService} from "../../../../services/transaction.service";
import {Transaction} from "../../../../models/transaction";

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {

  transaction: Transaction;
  loading: boolean = true;

  constructor(private route: ActivatedRoute,
              private transactionService: TransactionService,
              private router: Router) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.transactionService.getTransaction(params['_id'])
        .then(() => {
          this.transactionService.transaction.subscribe(trans => this.transaction = trans);
          this.loading = false;
        })
    })
  }

  finish() {
    this.transaction.complete = true;
    this.transaction.is_paid = true;
    this.transactionService.updateTransaction(this.transaction)
      .then(() => this.router.navigate(['/transactions']));8
  }

}
