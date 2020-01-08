import { Component, OnInit } from '@angular/core';
import {ItemService} from '../../services/item.service';
import {Item} from '../../models/item';

@Component({
  selector: 'app-admin-items',
  templateUrl: './admin-items.component.html',
  styleUrls: ['./admin-items.component.css']
})

export class AdminItemsComponent implements OnInit {

  constructor(private itemservice: ItemService) { }

  items: Item[];
  item_entry = {name: '', price: null, shop_cost: null, warning_quantity: 0, description: ''};

  ngOnInit() {
    this.itemservice.getItems()
      .then(items => this.items = items);
  }

  addItem() {
    // use the service and provide form values
    this.itemservice.addItem(
      this.item_entry.name,
      this.item_entry.description,
      this.item_entry.price,
      this.item_entry.shop_cost,
      this.item_entry.warning_quantity
    ).then(item => {
      this.items.unshift(item);
    });
  }
  /*
  updateItem(item: Item) {
    this.itemservice.updateItem(
      item._id,
      item.price,
      item.shop_cost,
      item.quantity,
      item.warning_quantity
    ).then( new_item => {
      const index = this.items.indexOf(item);
      if (index > -1) {
        this.items.splice(index, 1, new_item);
      }
    });
  }*/
}
