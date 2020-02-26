import { Component, OnInit } from '@angular/core';
import {ItemService} from '../../services/item.service';
import {Item} from '../../models/item';
import {FormBuilder, Validators} from '@angular/forms';
import {SearchService} from '../../services/search.service';
import {Observable} from 'rxjs/Observable';

@Component({
  selector: 'app-admin-items',
  templateUrl: './admin-items.component.html',
  styleUrls: ['./admin-items.component.css']
})

export class AdminItemsComponent implements OnInit {

  constructor(private itemService: ItemService,
              private formBuilder: FormBuilder,
              private searchService: SearchService) { }

  newItemForm = this.formBuilder.group({
    name: ['', Validators.required],
    category: ['', Validators.required],
    size: ['', Validators.required],
    brand: ['', Validators.required],
    condition: ['', Validators.required],
    desired_stock: ['', Validators.required],
    upc: ['', Validators.required],
    standard_price: ['', Validators.required],
    wholesale_cost: ['', Validators.required]
  });

  items: Item[];
  existingCategories = this.searchService.itemCategories();
  existingBrands = this.searchService.itemBrands();
  existingSizes: Observable<string[]>;

  ngOnInit() {
    this.itemService.getItems()
      .then(items => this.items = items);
    this.existingSizes = this.newItemForm.controls['category'].valueChanges
      .switchMap(newCategory => this.searchService.itemSizes(newCategory));
  }

  /**
   * Submits the item creation form, and creates the item
   */
  submitItemCreateForm() {
    this.itemService.createItem({
      _id: '',
      name: this.newItemForm.controls['name'].value,
      upc: this.newItemForm.controls['upc'].value,
      category: this.newItemForm.controls['category'].value,
      brand: this.newItemForm.controls['brand'].value,
      condition: this.newItemForm.controls['condition'].value,
      standard_price: this.newItemForm.controls['standard_price'].value,
      wholesale_cost: this.newItemForm.controls['wholesale_cost'].value,
      hidden: false,
      desired_stock: this.newItemForm.controls['desired_stock'].value,
      stock: 0
    }).then(res => {
      this.items.unshift(res);
      this.newItemForm.reset();
    });
  }

  /*
  updateItem(item: Item) {
    /*
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
