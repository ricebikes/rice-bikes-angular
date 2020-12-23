import {OrderRequest} from './orderRequest';

export class Order {
  _id: string;
  supplier: string;
  date_created: Date;
  date_submitted: Date;
  date_completed: Date;
  tracking_number: string;
  freight_charge: Number;
  total_price: number;
  notes: string;
  status: string;
  items: OrderRequest[];
}
