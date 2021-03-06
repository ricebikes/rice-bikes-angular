import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { TransactionService } from './services/transaction.service';
import { user_inactivity, user_timeout } from './config';
import { AppComponent } from './app.component';
import { TransactionsComponent } from './components/transactions/transactions.component';
import { AppRoutingModule } from './app-routing.module';
import { HttpModule } from '@angular/http';
import { TransactionDetailComponent } from './components/transactions/transaction-detail/transaction-detail.component';
import { NewTransactionComponent } from './components/new-transaction/new-transaction.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SearchService } from './services/search.service';
import { AddRepairComponent } from './components/add-repair/add-repair.component';
import { AddItemComponent } from './components/add-item/add-item.component';
import { SearchTransactionComponent } from './components/search-transaction/search-transaction.component';
import { LoginComponent } from './components/login/login.component';
import { AuthenticationService } from './services/authentication.service';
import { AuthGuard } from './guards/auth.guard';
import { NavbarComponent } from './components/navbar/navbar.component';
import { AlertComponent } from './components/alert/alert.component';
import { AlertService } from './services/alert.service';
import { AnalyticsService } from './services/analytics.service';
import { AuthComponent } from './components/auth/auth.component';
import { TimeAgoPipe } from 'time-ago-pipe';
import { AdminUsersComponent } from './components/admin-users/admin-users.component';
import { AdminService } from './services/admin.service';
import { CheckoutComponent } from './components/transactions/transaction-detail/checkout/checkout.component';
import { AdminRepairsComponent } from './components/admin-repairs/admin-repairs.component';
import { RepairService } from './services/repair.service';
import { AdminItemsComponent } from './components/admin-items/admin-items.component';
import { ItemService } from './services/item.service';
import { UserTrackerComponent } from './components/user-tracker/user-tracker.component';
import { UserIdleModule } from 'angular-user-idle/user-idle.module';
import { OrdersComponent } from './components/orders/orders.component';
import { OrderDetailComponent } from './components/orders/order-detail/order-detail.component';
import { NewOrderComponent } from './components/orders/new-order/new-order.component';
import { OrderService } from './services/order.service';
import { AnalyticsComponent } from './components/analytics/analytics.component';
import { OrderRequestService } from './services/order-request.service';
import { WhiteboardComponent } from './components/whiteboard/whiteboard.component';
import { OrderSelectorComponent } from './components/orders/order-selector/order-selector.component';
import { OrderRequestSelectorComponent } from './components/whiteboard/order-request-selector/order-request-selector.component';



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
    AnalyticsComponent,
    CheckoutComponent,
    AdminRepairsComponent,
    AdminItemsComponent,
    UserTrackerComponent,
    OrdersComponent,
    OrderDetailComponent,
    NewOrderComponent,
    WhiteboardComponent,
    OrderSelectorComponent,
    OrderRequestSelectorComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpModule,
    FormsModule,
    // 20 seconds until idle timer, 10 seconds to stop timer. 30 seconds total.
    UserIdleModule.forRoot({ idle: user_inactivity, timeout: user_timeout, ping: 120 }),
    ReactiveFormsModule
  ],
  providers: [
    TransactionService,
    SearchService,
    AnalyticsService,
    AuthenticationService,
    AuthGuard,
    AlertService,
    AdminService,
    OrderService,
    RepairService,
    OrderRequestService,
    ItemService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
