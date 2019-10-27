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
    this.sendReport(7);
  }

  sendReport(days: number){
    let today = new Date();
    let today_ms = Date.now();
    let dateSevDays = new Date(today_ms - (days * 24 * 60 * 60 * 1000)); // last 7 days: # of milliseconds

    //this.transaction.date_completed = date;
    var datesMap = {"startDate": dateSevDays, "endDate": today};
    this.transactionService.getTransactionsByDate(datesMap).then(transactions => {
      console.log("these are the transactions" + transactions.toString());
      var days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
      //var weekMap = {"Monday": {}, "Tuesday": {}, "Wednesday": {}, "Thursday":{}, "Friday":{}, "Saturday":{}, "Sunday":{}};
      var weekMap = {};
      for(var day in days){
        weekMap[days[day]] = {"date": "No transactions this day", "cash":0, "card": 0, "check": 0}
      }

      var total = 0;
      for(var index in transactions){
        var trans = transactions[index];
        var theDate = new Date(trans.date_paid);
        weekMap[days[theDate.getDay()]]["date"] = theDate.getMonth()+1 + "/" + theDate.getDate() + "/" + theDate.getFullYear();
        for(var index in trans.paymentType){
          weekMap[days[theDate.getDay()]][trans.paymentType[index]] += trans.total_cost;
          total += trans.total_cost;
        }
      }
      console.log(weekMap);
      console.log(total);
      this.transactionService.sendEmail({total_revenue: total, all_days: weekMap}).then(() => console.log("Sent email"));
    });


  }

}
