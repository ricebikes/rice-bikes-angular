import { Component, OnInit } from '@angular/core';
import { TransactionService } from "../../services/transaction.service";
import {Transaction} from "../../models/transaction";
import {Chart} from 'chart.js'

@Component({
  selector: 'app-admin-financial',
  templateUrl: './admin-financial.component.html',
  styleUrls: ['./admin-financial.component.css']
})
export class AdminFinancialComponent implements OnInit {

  constructor(
    private transactionService: TransactionService)
  {}

  transactions: Transaction[];

  ngOnInit() {
    // var props = { complete: true , is_paid: true}; //completed and paid - tracking financial
    // this.transactionService.getTransactions(props).then(transactions =>{
    //   for(var index = 0; index <= Object.keys(transactions).length; index++){
    //     var theDate = new Date(transactions[index].date_created);
    //     if(Math.abs(new Date().getMonth() - theDate.getMonth()) <= 5){ //change this 5 later: last 5 months
    //       //this.transactions.push(transactions[index]);
    //     }
    //   }
    // });
  }

  sendReport(days: number){
    let today = new Date();
    let today_ms = Date.now();
    let dateSevDays = new Date(today_ms - (days * 24 * 60 * 60 * 1000)); // last 7 days: # of milliseconds

    //this.transaction.date_completed = date;
    var datesMap = {"startDate": dateSevDays, "endDate": today};
    this.transactionService.getTransactionsByDate(datesMap).then(transactions => {
      console.log("these are the transactions" + transactions.toString());
    });


  }

}
