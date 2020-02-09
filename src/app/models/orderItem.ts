import {Item} from './item';

export class OrderItem {
  _id: string;
  item: Item;
  quantity: number;
  transaction: string; // ID value of transaction
}
