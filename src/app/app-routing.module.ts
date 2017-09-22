import { RouterModule, Routes } from "@angular/router";
import { NgModule } from "@angular/core";
import { TransactionsComponent } from "./components/transactions/transactions.component";
import { TransactionDetailComponent } from "./components/transaction-detail/transaction-detail.component";
import { NewTransactionComponent } from "./components/new-transaction/new-transaction.component";
import { AuthGuard } from "./guards/auth.guard";

const routes: Routes = [
  {
    path: '',
    redirectTo: '/transactions',
    pathMatch: 'full'
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
        component: TransactionDetailComponent
      },
    ]
  },

  {
    path: 'login'
  }

];

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})

export class AppRoutingModule {}
