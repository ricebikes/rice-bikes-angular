import { Item } from "./item";
import { Action } from "./action";

export class OrderRequest {
  _id: number;
  request: string;
  partNumber: string; // If known, the part number of the item
  quantity: number;
  transactions: number[]; // ID value of transactions, not auto populated
  notes: String;
  itemRef: Item;
  status: String;
  supplier: String;
  orderRef: string; // ID of order, not auto populated
  actions: Action[];
}
