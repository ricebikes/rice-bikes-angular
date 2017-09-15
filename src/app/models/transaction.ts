import {Customer} from "./customer";

export class Transaction {
  _id: string;
  date_created: string;
  description: string;
  transaction_type: string;
  customer: Customer;
  bikes: any[];
  items: any[];
  repairs: any[];

  constructor() {}
}
