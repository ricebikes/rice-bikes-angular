import {Item} from './item';
import {Action} from './action';

export class OrderRequest {
  _id: number;
  request: string;
  status: string;
  supplier: string;
  associatedOrder: string;
  item: Item;
  quantity: number;
  transaction: string; // ID value of transaction
  actions: Action[];
}
