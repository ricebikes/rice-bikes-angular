import {Customer} from "./customer";
import {Bike} from "./bike";
import {Item} from "./item";
import {Repair} from "./repair";

export class Transaction {
  _id: string;
  date_created: string;
  date_completed: string;
  completed: boolean;
  description: string;
  transaction_type: string;
  customer: Customer;
  bikes: Bike[];
  items: Item[];
  repairs: Repair[];

  constructor() {}
}
