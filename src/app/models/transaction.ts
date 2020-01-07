import {Customer} from "./customer";
import {Bike} from "./bike";
import {Item} from "./item";
import {RepairItem} from "./repairItem";
import {Action} from './action';

export class Transaction {
  _id: string;
  date_created: string;
  date_completed: string;
  complete: boolean;
  is_paid: boolean;
  waiting_part: boolean;
  urgent: boolean;
  waiting_email: boolean;
  total_cost: number;
  description: string;
  transaction_type: string;
  customer: Customer;
  bikes: Bike[];
  items: Item[];
  repairs: RepairItem[];
  actions: Action[];

  refurb: boolean;

  constructor() {}
}
