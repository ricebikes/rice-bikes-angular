import { Component, OnInit } from '@angular/core';
import { TransactionService } from "../../services/transaction.service";
@Component({
  selector: 'app-admin-financial',
  templateUrl: './admin-financial.component.html',
  styleUrls: ['./admin-financial.component.css']
})
export class AdminFinancialComponent implements OnInit {

  constructor(
    private transactionService: TransactionService)
  {}

  ngOnInit() {
  }

}
