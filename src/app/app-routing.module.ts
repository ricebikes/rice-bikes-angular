import { RouterModule, Routes } from "@angular/router";
import { NgModule } from "@angular/core";
import { TransactionsComponent } from "./components/transactions/transactions.component";
import { TransactionDetailComponent } from "./components/transactions/transaction-detail/transaction-detail.component";
import { NewTransactionComponent } from "./components/new-transaction/new-transaction.component";
import { AuthGuard } from "./guards/auth.guard";
import { LoginComponent } from "./components/login/login.component";
import {AuthComponent} from "./components/auth/auth.component";
import {AdminUsersComponent} from "./components/admin-users/admin-users.component";
import {CheckoutComponent} from "./components/transactions/transaction-detail/checkout/checkout.component";

const routes: Routes = [
  {
    path: '',
    redirectTo: '/transactions',
    pathMatch: 'full'
  },

  {
    path: 'auth',
    component: AuthComponent
  },

  {
    path: 'transactions',
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        component: TransactionsComponent,
        pathMatch: 'full'
      },

      {
        path: 'new',
        component: NewTransactionComponent
      },

      {
        path: ':_id',
        children: [
          {
            path: '',
            component: TransactionDetailComponent,
            pathMatch: 'full'
          },

          {
            path: 'checkout',
            component: CheckoutComponent,
          }
        ]
      },
    ]
  },

  {
    path: 'login',
    component: LoginComponent
  },

  {
    path: 'admin',
    canActivate: [AuthGuard],
    children: [
      {
        path: 'users',
        component: AdminUsersComponent
      }
    ]
  }

];

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})

export class AppRoutingModule {}
