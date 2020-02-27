export class Item {
  _id: string;
  name: string;
  upc: number;
  category: string;
  size: string;
  brand: string;
  condition: string;
  standard_price: string;
  wholesale_cost: string;
  disabled: boolean;
  managed: boolean; // the backend uses this to handle items like tax that the frontend should not interact with
  desired_stock: number;
  stock: number;
}
