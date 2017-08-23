import { Component, OnInit } from '@angular/core';
import {TransactionService} from "../../services/transaction.service";
import {Transaction} from "../../models/transaction";
import {Router} from "@angular/router";

@Component({
  selector: 'app-button-bar',
  templateUrl: 'button-bar.component.html',
  styleUrls: ['button-bar.component.css']
})
export class ButtonBarComponent implements OnInit {

  constructor(
    private transactionService: TransactionService,
    private router: Router,
  ) { }

  ngOnInit(): void {
  }

  createTransaction(type: string): void {
    this.transactionService.createTransaction(type)
      .then(transaction => this.router.navigate(['transactions', transaction.id]));
  }

}
