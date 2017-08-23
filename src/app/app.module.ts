import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { TransactionService } from "./services/transaction.service";
import { AppComponent } from './app.component';
import { TransactionsComponent } from './components/transactions/transactions.component';
import { AppRoutingModule } from "./app-routing.module";
import { HttpModule } from "@angular/http";
import { ButtonBarComponent } from './components/button-bar/button-bar.component';
import { TransactionDetailComponent } from './components/transaction-detail/transaction-detail.component';

@NgModule({
  declarations: [
    AppComponent,
    TransactionsComponent,
    ButtonBarComponent,
    TransactionDetailComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpModule,
  ],
  providers: [
    TransactionService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
