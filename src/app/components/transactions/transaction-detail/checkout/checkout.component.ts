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
  emailingReceipt = false;

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
    /**
     * This displays a loading wheel while we email receipt, and blocks 
     * user clicking again
     */
    setTimeout(() => {
      alert("NOTE: Emails are not auto-sending correctly, so the customer will not get an email receipt. Tell them this if they do not take the printed copy.");
      this.emailingReceipt = true;
      this.transactionService.setPaid(this.transaction._id, this.transaction.is_paid)
        .then(() => {
          this.emailingReceipt = true;
          this.finishModal.nativeElement.click();
          this.router.navigate(['/transactions']);
          this.analyticsService.notifyTransactionStatusChange(this.transaction._id);
        });
    },300)
    
  }
}
