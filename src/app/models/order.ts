import {OrderItem} from './orderItem';

export class Order {
  _id: string;
  supplier: string;
  date_created: Date;
  date_submitted: Date;
  date_completed: Date;
  tracking_number: string;
  status: string;
  items: OrderItem[];
}
