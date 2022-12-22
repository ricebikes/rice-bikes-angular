export class Item {
  _id: string;
  name: string;
  upc: string;
  category_1: string,
  category_2: string,
  category_3: string,
  brand: string,
  specifications: { [key: string]: string },
  features: string[],
  standard_price: number;
  wholesale_cost: number;
}
/*** OLD ***/
// export class Item {
//   _id: string;
//   name: string;
//   upc: number;
//   category: string;
//   size: string;
//   brand: string;
//   condition: string;
//   standard_price: string;
//   wholesale_cost: string;
//   disabled: boolean;
//   managed: boolean; // the backend uses this to handle items like tax that the frontend should not interact with
//   desired_stock: number;
//   minimum_stock: number;
//   stock: number;
// }
