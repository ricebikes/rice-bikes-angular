import {Customer} from './customer';
import {Bike} from './bike';
import {RepairItem} from './repairItem';
import {Action} from './action';
import {TransactionItem} from './transactionItem';
import { OrderRequest } from './orderRequest';

export class Transaction {
  _id: string;
  status: string;
  date_created: string;
  date_completed: string;
  complete: boolean;
  reserved: boolean;
  is_paid: boolean;
  urgent: boolean;
  nuclear: boolean;
  waiting_email: boolean;
  employee: boolean;
  total_cost: number;
  description: string;
  transaction_type: string;
  customer: Customer;
  bikes: Bike[];
  items: TransactionItem[];
  repairs: RepairItem[];
  actions: Action[];
  refurb: boolean;
  beerbike: boolean;
  orderRequests: OrderRequest[];
  constructor() {}
}
