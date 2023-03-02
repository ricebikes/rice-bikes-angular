import {
  Component,
  ElementRef,
  OnInit,
  Renderer2,
  ViewChild,
} from "@angular/core";
import { ItemService } from "../../services/item.service";
import { Item } from "../../models/item";
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

  itemModalMode = 1;
  chosenItem: Item;
  showInStock: boolean = false;
  chosenIdx: number;
  inStockItems: Item[];
  items: Item[];
  categories = this.searchService.itemCategories1();
  brands = this.searchService.itemBrands();

  closeAndResetAll(message: string) {
    console.log("emitted", message, "from item details form component");
  }

  ngOnInit() {
    this.itemService.getItems().then((res) => {
      this.items = this.sortItems(res);
      this.inStockItems = this.items.filter(
        (i) => i.in_stock && i.in_stock > 0
      );
    });
  }

  setItems(items: Item[]) {
    this.items = this.sortItems(items);
    this.inStockItems = items.filter((i) => i.in_stock && i.in_stock > 0);
    console.log("in stock items", this.inStockItems);
  }

  /**
   * Sorts the item list, such that it is in reverse order, and disabled items go at the bottom.
   * @param items: item list to sort
   */
  sortItems(items: Item[]) {
    return items.reverse();
  }

  editItem(item, idx) {
    // enable item-details-form modal in edit mode and fill the values with chosenItem
    this.chosenItem = item;
    this.chosenIdx = idx;
    this.itemModalMode = 1;
    this.triggerItemDetailsModal();
  }

  refreshItem(item: Item) {
    // replace the item at index this.idx with the newly updated item
    if (this.showInStock) {
      this.inStockItems[this.chosenIdx] = item;
    } else this.items[this.chosenIdx] = item;
  }

  toggleCheck(checked: boolean) {
    console.log("checked", checked);
    this.showInStock = checked;
    this.inStockItems = this.items.filter((i) => i.in_stock && i.in_stock > 0);
    console.log(this.inStockItems);
  }

  triggerCreateItem() {
    this.itemModalMode = 0;
    this.triggerItemDetailsModal();
  }

  triggerItemDetailsModal() {
    this.formTrigger.nativeElement.click();
  }
}
