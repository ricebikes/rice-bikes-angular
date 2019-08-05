import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {TransactionService} from "../../../../services/transaction.service";
import {Transaction} from "../../../../models/transaction";

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
        .then(() => {
          this.transactionService.transaction.subscribe(trans => this.transaction = trans);
          this.loading = false;
          this.transaction.paymentType = "";
        })
    })
  }

  finish() {
    this.transaction.complete = true;
    this.transaction.is_paid = true;
    console.log(this.transaction.paymentType);
    this.transactionService.updateTransaction(this.transaction)
      .then(() => {
        this.finishModal.nativeElement.click();
        this.router.navigate(['/transactions']);
      });
  }

  onSelectPayment(pay_val:string): void{
    this.transaction.paymentType = pay_val;
    console.log("Changed to:" + this.transaction.paymentType);
  }
}
