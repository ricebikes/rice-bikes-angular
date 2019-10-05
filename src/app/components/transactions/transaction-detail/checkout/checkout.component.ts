import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {TransactionService} from "../../../../services/transaction.service";
import {Transaction} from "../../../../models/transaction";
import {User} from '../../../../models/user';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {

  @ViewChild('finishModal') finishModal: ElementRef;

  transaction: Transaction;
  loading: boolean = true;
  isEdit: boolean = false;

  constructor(private route: ActivatedRoute,
              private transactionService: TransactionService,
              private router: Router) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.transactionService.getTransaction(params['_id'])
        .subscribe(() => {
          this.transactionService.transaction.subscribe(trans => this.transaction = trans);
          this.loading = false;
        })
    })
  }

  finish(user: User) {
    this.transaction.complete = true;
    this.transaction.is_paid = true;
    this.transactionService.updateTransactionPaid(this.transaction, user)
      .subscribe(() => {
        this.finishModal.nativeElement.click();
        this.router.navigate(['/transactions']);
      });
  }
}
