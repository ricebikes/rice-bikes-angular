import {
  Component,
  ElementRef,
  OnInit,
  Renderer2,
  ViewChild,
} from "@angular/core";
import { ItemService } from "../../services/item.service";
import { Item } from "../../models/item";
import { ItemDetailsFormComponent } from "../item-details-form/item-details-form.component";
import { FormBuilder, Validators } from "@angular/forms";
import { SearchService } from "../../services/search.service";
import { Observable } from "rxjs/Observable";
import { AlertService } from "../../services/alert.service";

@Component({
  selector: "app-admin-items",
  templateUrl: "./admin-items.component.html",
  styleUrls: ["./admin-items.component.css"],
})
export class AdminItemsComponent implements OnInit {
  constructor(
    private itemService: ItemService,
    private formBuilder: FormBuilder,
    private searchService: SearchService,
    private renderer: Renderer2
  ) {
    this.renderer.listen("window", "click", (e: Event) => {
      if (e.target == this.itemDetailsModal.nativeElement) {
        this.closeAndResetAll("clicked out of modal");
      }
    });
  }

  @ViewChild("itemDetailsModal") itemDetailsModal: ElementRef;
  @ViewChild("formTrigger") formTrigger: ElementRef;
  @ViewChild("itemDetailsForm") itemDetailsForm: ItemDetailsFormComponent;

  objectKeys = Object.keys

  itemModalMode = 1;
  chosenItem: Item;
  showInStock: boolean = false;
  chosenIdx: number;
  inStockItems: Item[];
  items: Item[];
  categories = this.searchService.itemCategories1();
  brands = this.searchService.itemBrands();

  // barcode printing specs
  elementType = "svg";
  format = "UPC";
  width = 2;
  height = 100;
  displayValue = true;
  font = "monospace";
  textMargin = 2;
  fontSize = 20;
  margin = 5;

  fieldFilters = {
    name: true,
    "category 1": true,
    "category 2": true,
    "category 3": true,
    brand: true,
    "retail price": true,
    "wholesale cost": true,
    "in stock": false,
    "threshold stock": false
  };

  stockFilters = {
    "in stock": true,
    "out of stock": true,
    "core stock": false,
    disabled: false,
  };

  loaded = false;

  // on page on, retrieves all items and sets items + in stock items
  ngOnInit() {
    this.itemService.getItems().then((res) => {
      this.items = this.sortItems(res);
      this.inStockItems = this.items.filter(
        (i) => i.in_stock && i.in_stock > 0
      );
      this.loaded = true;
    });
  }

  // filters transactions using the filters in stockFilters
  toggleFilters(filterName) {
    this.stockFilters[filterName] = !this.stockFilters[filterName];
  }

  filterItems() {
    if(!this.loaded) return;
    let filtered = this.items;
    if(!this.stockFilters["in stock"])
      filtered = filtered.filter(item => !(item.in_stock > 0))
    if(!this.stockFilters["out of stock"])
      filtered = filtered.filter(item => item.in_stock > 0);
    if(this.stockFilters["core stock"])
      filtered = filtered.filter(item => item.threshold_stock > 0)

    return filtered;
  }

  // updates the table with the new item once created from item modal
  addItem(item: Item) {
    console.log("item created", item);
    this.items.splice(0, 0, item);
    if (item.in_stock && item.in_stock > 0)
      this.inStockItems.splice(0, 0, item);
  }

  // resets all the modals and local variables. wonder if there's a way to do this more gracefully?
  closeAndResetAll(message: string) {
    this.itemDetailsForm.resetForms();
  }

  setItems(items: Item[]) {
    this.items = this.sortItems(items);
    this.inStockItems = items.filter((i) => i.in_stock && i.in_stock > 0);
  }

  /**
   * Sorts the item list, such that it is in reverse order, and disabled items go at the bottom.
   * @param items: item list to sort
   */
  sortItems(items: Item[]) {
    return items.reverse();
  }

  disableItem(item) {
    item.disabled = true;
    // convert old items category to category_1
    if(item.category) item.category_1 = item.category;
    console.log('disabled item', item);
    this.itemService.updateItem(item._id, item);
  }

  editItem(item, idx) {
    // enable item-details-form modal in edit mode and fill the values with chosenItem
    this.chosenItem = item;
    this.chosenIdx = idx;
    this.itemModalMode = 1;
    this.formTrigger.nativeElement.click();
  }

  refreshItem(item: Item) {
    // refreshes the item list with the item that was just edited
    this.itemService.getItems().then((res) => {
      this.items = this.sortItems(res);
      this.inStockItems = this.items.filter(
        (i) => i.in_stock && i.in_stock > 0
      );
    });
  }

  toggleCheck(checked: boolean) {
    this.showInStock = checked;
    this.inStockItems = this.items.filter((i) => i.in_stock && i.in_stock > 0);
    console.log(this.inStockItems);
  }

  triggerCreateItem() {
    this.itemModalMode = 0;
    this.formTrigger.nativeElement.click();
  }

  triggerScanModal() {

  }
  
  openItemMenu(item?: Item) {
    console.log("clicked menu item");
    this.chosenItem = item;
  }

  print(): void {
    this.itemDetailsForm.print();
  }
}
