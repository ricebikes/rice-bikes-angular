import {OrderItem} from './orderItem';

export class Order {
  supplier: string;
  date_created: Date;
  tracking_number: string;
  status: string;
  items: OrderItem[];
}
