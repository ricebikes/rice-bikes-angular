import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TransactionService } from '../../../../services/transaction.service';
import { Transaction } from '../../../../models/transaction';
import { AnalyticsService } from '../../../../services/analytics.service';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {

  @ViewChild('finishModal') finishModal: ElementRef;

  transaction: Transaction;
  loading = true;

  constructor(private route: ActivatedRoute,
    private transactionService: TransactionService,
    private router: Router,
    private analyticsService: AnalyticsService) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.transactionService.getTransaction(params['_id'])
        .then(() => {
          this.transactionService.transaction.subscribe(trans => this.transaction = trans);
          this.loading = false;
        });
    });
  }

  finish() {
    this.transaction.complete = true;
    this.transaction.is_paid = true;
    this.transactionService.setPaid(this.transaction._id, this.transaction.is_paid)
      .then(() => {
        this.finishModal.nativeElement.click();
        this.router.navigate(['/transactions']);
        this.analyticsService.notifyTransactionStatusChange(this.transaction._id);
      });
  }
}
