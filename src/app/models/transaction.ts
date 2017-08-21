import {Customer} from "./customer";

export class Transaction {
  constructor(
    id: number,
    date_created: Date,
    description: string,
    transaction_type: string,
    customer: Customer,
    customer_id: number,
    bikes: any[],
    items: any[],
    repairs: any[]
  ) {}
}
