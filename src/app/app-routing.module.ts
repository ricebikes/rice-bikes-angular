import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { TransactionsComponent } from './components/transactions/transactions.component';
import { TransactionDetailComponent } from './components/transactions/transaction-detail/transaction-detail.component';
import { NewTransactionComponent } from './components/new-transaction/new-transaction.component';
import { AuthGuard } from './guards/auth.guard';
import { LoginComponent } from './components/login/login.component';
import {AuthComponent} from './components/auth/auth.component';
import {AdminUsersComponent} from './components/admin-users/admin-users.component';
import {CheckoutComponent} from './components/transactions/transaction-detail/checkout/checkout.component';
import {AdminRepairsComponent} from './components/admin-repairs/admin-repairs.component';
import {AdminItemsComponent} from './components/admin-items/admin-items.component';
import {OrdersComponent} from './components/orders/orders.component';
import {NewOrderComponent} from './components/orders/new-order/new-order.component';
import {OrderDetailComponent} from './components/orders/order-detail/order-detail.component';
import {AnalyticsComponent} from './components/analytics/analytics.component';
import {WhiteboardComponent} from './components/whiteboard/whiteboard.component';

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
      },
      {
        path: 'repairs',
        component: AdminRepairsComponent
      },
      {
        path: 'items',
        component: AdminItemsComponent
      },
      {
        path: 'analytics',
        component: AnalyticsComponent
      }
    ]
  },

  {
    path: 'orders',
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        component: OrdersComponent,
        pathMatch: 'full'
      },
      {
        path: 'new',
        component: NewOrderComponent
      },
      {
        path: 'whiteboard',
        component: WhiteboardComponent
      },
      {
        path: ':_id',
        component: OrderDetailComponent
      }
    ]
  }
];

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})

export class AppRoutingModule {}
