import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {ItemService} from '../../services/item.service';
import {Item} from '../../models/item';
import {FormBuilder, Validators} from '@angular/forms';
import {SearchService} from '../../services/search.service';
import {Observable} from 'rxjs/Observable';
import {AlertService} from '../../services/alert.service';

@Component({
  selector: 'app-admin-items',
  templateUrl: './admin-items.component.html',
  styleUrls: ['./admin-items.component.css']
})

export class AdminItemsComponent implements OnInit {

  constructor(private itemService: ItemService,
              private formBuilder: FormBuilder,
              private searchService: SearchService) { }

  @ViewChild('editItemToggle') editItemToggle: ElementRef;

  newItemForm = this.formBuilder.group({
    name: ['', Validators.required],
    category: ['', Validators.required],
    size: ['', Validators.required],
    brand: ['', Validators.required],
    condition: ['', Validators.required],
    desired_stock: ['', Validators.required],
    upc: [''],
    standard_price: ['', Validators.required],
    wholesale_cost: ['', Validators.required]
  });

  editItemForm = this.formBuilder.group({
    itemID: ['', Validators.required], // Not displayed in form control but used for tracking what item we are editing.
    name: ['', Validators.required],
    category: ['', Validators.required],
    size: [''],
    brand: [''],
    condition: ['', Validators.required],
    desired_stock: ['', Validators.required],
    minimum_stock: [''],
    upc: [''],
    standard_price: ['', Validators.required],
    wholesale_cost: ['', Validators.required],
    stock: [''],
    disabled: ['']
  });

  items: Item[];
  existingCategories = this.searchService.itemCategories();
  existingBrands = this.searchService.itemBrands();
  existingSizes: Observable<String[]>;
  existingUpdateSizes: Observable<String[]>;

  ngOnInit() {
    this.itemService.getItems().then(res => this.items = this.sortItems(res));
    this.existingSizes = this.newItemForm.controls['category'].valueChanges
      .switchMap(newCategory => this.searchService.itemSizes(newCategory));
    this.existingUpdateSizes = this.editItemForm.controls['category'].valueChanges
      .switchMap(newCategory => this.searchService.itemSizes(newCategory));
  }

  /**
   * Sorts the item list, such that it is in reverse order, and disabled items go at the bottom.
   * @param items: item list to sort
   */
  sortItems(items: Item[]) {
    return items.reverse().sort((a, b) => {
      if (a.disabled === b.disabled) {
        // both items have the same rank
        return 0;
      } else {
        // choose where to sort a based on if it is disabled
        return a.disabled ? 1 : -1;
      }
    });
  }

  /**
   * Submits the item creation form, and creates the item
   */
  submitItemCreateForm() {
    if (this.newItemForm.invalid) {return; }
    this.itemService.createItem({
      _id: '',
      name: this.newItemForm.controls['name'].value,
      upc: this.newItemForm.controls['upc'].value,
      category: this.newItemForm.controls['category'].value,
      size: this.newItemForm.controls['size'].value,
      brand: this.newItemForm.controls['brand'].value,
      condition: this.newItemForm.controls['condition'].value,
      standard_price: this.newItemForm.controls['standard_price'].value,
      wholesale_cost: this.newItemForm.controls['wholesale_cost'].value,
      disabled: false,
      managed: false,
      desired_stock: this.newItemForm.controls['desired_stock'].value,
      minimum_stock: null,
      stock: 0
    }).then(res => {
      // reload the item list
      this.items.unshift(res);
      this.newItemForm.reset();
    });
  }

  editItem(item) {
    this.editItemForm.controls['itemID'].setValue(item._id);
    this.editItemForm.controls['name'].setValue(item.name);
    this.editItemForm.controls['upc'].setValue(item.upc);
    this.editItemForm.controls['category'].setValue(item.category);
    this.editItemForm.controls['size'].setValue(item.size);
    this.editItemForm.controls['brand'].setValue(item.brand);
    this.editItemForm.controls['condition'].setValue(item.condition);
    this.editItemForm.controls['standard_price'].setValue(item.standard_price);
    this.editItemForm.controls['wholesale_cost'].setValue(item.wholesale_cost);
    this.editItemForm.controls['desired_stock'].setValue(item.desired_stock);
    this.editItemForm.controls['minimum_stock'].setValue(item.minimum_stock);
    this.editItemForm.controls['stock'].setValue(item.stock);
    this.editItemForm.controls['disabled'].setValue(item.disabled);
    this.editItemToggle.nativeElement.click();
  }

  /**
   * Toggles the disabled state of an item
   * @param item: item to toggle state of
   */
  toggleDisabled(item: Item) {
    item.disabled = !item.disabled;
    AlertService.debugLog(item);
    this.itemService.updateItem(item._id, item).then(res => {
      this.itemService.getItems().then(response => this.items = this.sortItems(response));
    });
  }

  submitItemUpdateForm() {
    if (this.editItemForm.invalid) {return; }
    this.itemService.updateItem(this.editItemForm.controls['itemID'].value, {
      _id: '',
      name: this.editItemForm.controls['name'].value,
      category: this.editItemForm.controls['category'].value,
      size: this.editItemForm.controls['size'].value,
      brand: this.editItemForm.controls['brand'].value,
      condition: this.editItemForm.controls['condition'].value,
      desired_stock: this.editItemForm.controls['desired_stock'].value,
      minimum_stock: this.editItemForm.controls['minimum_stock'].value,
      upc: this.editItemForm.controls['upc'].value,
      standard_price: this.editItemForm.controls['standard_price'].value,
      wholesale_cost: this.editItemForm.controls['wholesale_cost'].value,
      stock: this.editItemForm.controls['stock'].value,
      disabled: this.editItemForm.controls['disabled'].value || false,
      managed: false
    }).then(res => {
      // update item list
      this.itemService.getItems().then(response => this.items = this.sortItems(response));
      this.editItemToggle.nativeElement.click();
      this.editItemForm.reset();
    });
  }
}
