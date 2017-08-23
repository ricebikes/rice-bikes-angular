import { RouterModule, Routes } from "@angular/router";
import { NgModule } from "@angular/core";
import { TransactionsComponent } from "./components/transactions/transactions.component";
import {TransactionDetailComponent} from "./components/transaction-detail/transaction-detail.component";

const routes: Routes = [
  {
    path: '',
    redirectTo: '/transactions',
    pathMatch: 'full'
  },

  {
    path: 'transactions',
    component: TransactionsComponent,
    children: [
      {
        path: ':id',
        component: TransactionDetailComponent
      }
    ]
  }
];

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})

export class AppRoutingModule {}
