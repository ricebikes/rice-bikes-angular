import {Item} from './item';

export class OrderItem {
  item: Item;
  quantity: number;
  transaction: string; // ID value of transaction
}
