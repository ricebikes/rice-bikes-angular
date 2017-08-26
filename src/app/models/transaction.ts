import {Customer} from "./customer";

export class Transaction {
  id: number;
  date_created: string;
  description: string;
  transaction_type: string;
  customer: Customer;
  customer_id: number;
  bikes: any[];
  items: any[];
  repairs: any[];

  constructor() {}
}
