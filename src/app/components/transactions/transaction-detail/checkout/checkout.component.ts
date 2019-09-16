import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {TransactionService} from "../../../../services/transaction.service";
import {Transaction} from "../../../../models/transaction";

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css', '../../../../../../node_modules/pretty-checkbox/src/pretty-checkbox.scss']
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
          this.transaction.paymentType = [];
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

  onSelectPayment(pay_val:string, checked:boolean): void{
    var indexPay = this.transaction.paymentType.indexOf(pay_val);
    if(checked){
      if(!(indexPay >= 0)){
        this.transaction.paymentType.push(pay_val);
      }
    }
    else{
      if(indexPay >= 0){
        this.transaction.paymentType.splice(indexPay, 1);
      }
    }
    console.log("This is paymentArray "+this.transaction.paymentType + typeof this.transaction.paymentType);


    //console.log("Changed to:" + this.transaction.paymentType);
  }
}
