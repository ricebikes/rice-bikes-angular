import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { TransactionService } from "./services/transaction.service";
import { AppComponent } from './app.component';
import { TransactionsComponent } from './components/transactions/transactions.component';
import { AppRoutingModule } from "./app-routing.module";
import { HttpModule } from "@angular/http";
import { ButtonBarComponent } from './components/button-bar/button-bar.component';
import { TransactionDetailComponent } from './components/transaction-detail/transaction-detail.component';
import { NewTransactionComponent } from './components/new-transaction/new-transaction.component';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {SearchService} from "./services/search.service";
import { AddRepairComponent } from './components/add-repair/add-repair.component';
import { AddItemComponent } from './components/add-item/add-item.component';
import { SearchTransactionComponent } from './components/search-transaction/search-transaction.component';
import { ActiveTransactionsComponent } from './components/active-transactions/active-transactions.component';
import { CompletedTransactionsComponent } from './components/completed-transactions/completed-transactions.component';

@NgModule({
  declarations: [
    AppComponent,
    TransactionsComponent,
    ButtonBarComponent,
    TransactionDetailComponent,
    NewTransactionComponent,
    AddRepairComponent,
    AddItemComponent,
    SearchTransactionComponent,
    ActiveTransactionsComponent,
    CompletedTransactionsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [
    TransactionService,
    SearchService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
