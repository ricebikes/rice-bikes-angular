import { Item } from "./item";
import { Action } from "./action";

export class OrderRequest {
  _id: number;
  request: string;
  quantity: number;
  transactions: number[]; // ID value of transactions, not auto populated
  notes: String;
  itemRef: Item;
  status: String;
  actions: Action[];
}
