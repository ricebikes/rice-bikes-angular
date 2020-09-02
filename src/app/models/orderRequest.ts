import {Item} from './item';
import {Action} from './action';
import { Order } from './order';

export class OrderRequest {
  _id: number;
  item: Item;
  request: string;
  status: string;
  supplier: string;
  quantity: number;
  transaction: number; // ID value of transaction, not auto populated
  orderRef: string; // ID of order, not auto populated
  actions: Action[];
}
