import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { TransactionService } from "./services/transaction.service";
import { AppComponent } from './app.component';
import { TransactionsComponent } from './components/transactions/transactions.component';
import { AppRoutingModule } from "./app-routing.module";
import { HttpModule } from "@angular/http";
import { TransactionDetailComponent } from './components/transactions/transaction-detail/transaction-detail.component';
import { NewTransactionComponent } from './components/new-transaction/new-transaction.component';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {SearchService} from "./services/search.service";
import { AddRepairComponent } from './components/add-repair/add-repair.component';
import { AddItemComponent } from './components/add-item/add-item.component';
import { SearchTransactionComponent } from './components/search-transaction/search-transaction.component';
import { LoginComponent } from './components/login/login.component';
import {AuthenticationService} from "./services/authentication.service";
import {AuthGuard} from "./guards/auth.guard";
import { NavbarComponent } from './components/navbar/navbar.component';
import { AlertComponent } from './components/alert/alert.component';
import {AlertService} from "./services/alert.service";
import { AuthComponent } from './components/auth/auth.component';
import {TimeAgoPipe} from "time-ago-pipe";
import { AdminUsersComponent } from './components/admin-users/admin-users.component';
import {AdminService} from "./services/admin.service";
import { CheckoutComponent } from './components/transactions/transaction-detail/checkout/checkout.component';
import {AdminRepairsComponent} from './components/admin-repairs/admin-repairs.component';
import {RepairService} from './services/repair.service';
import { AdminItemsComponent } from './components/admin-items/admin-items.component';
import {ItemService} from './services/item.service';
import { AdminFinancialComponent } from './components/admin-financial/admin-financial.component';



@NgModule({
  declarations: [
    AppComponent,
    TransactionsComponent,
    TransactionDetailComponent,
    NewTransactionComponent,
    AddRepairComponent,
    AddItemComponent,
    SearchTransactionComponent,
    LoginComponent,
    NavbarComponent,
    AlertComponent,
    AuthComponent,
    TimeAgoPipe,
    AdminUsersComponent,
    CheckoutComponent,
    AdminRepairsComponent,
    AdminItemsComponent,
    AdminFinancialComponent,
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
    SearchService,
    AuthenticationService,
    AuthGuard,
    AlertService,
    AdminService,
    RepairService,
    ItemService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
