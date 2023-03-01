import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
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
    private searchService: SearchService
  ) {}

  @ViewChild("itemDetailsModal") itemDetailsModal: ElementRef;
  @ViewChild("formTrigger") formTrigger: ElementRef;

  clicked: boolean;

  newItemForm = this.formBuilder.group({
    name: ["", Validators.required],
    brand: ["", Validators.required],
    standard_price: ["", Validators.required],
    upc: ["", [Validators.required, Validators.pattern("[0-9]+")]],
    category_1: ["Any", Validators.required],
    category_2: "",
    category_3: "",
    wholesale_cost: ["", Validators.required],
    specifications: this.formBuilder.array([]),
    features: this.formBuilder.array([]),
    in_stock: ["", Validators.required],
  });

  items: Item[];
  categories = this.searchService.itemCategories1();
  brands = this.searchService.itemBrands();

  ngOnInit() {
    this.itemService
      .getItems()
      .then((res) => (this.items = this.sortItems(res)));
  }

  /**
   * Sorts the item list, such that it is in reverse order, and disabled items go at the bottom.
   * @param items: item list to sort
   */
  sortItems(items: Item[]) {
    return items.reverse();
  }

  /**
   * Submits the item creation form, and creates the item
   */
  submitItemCreateForm() {
    if (this.newItemForm.invalid) {
      return;
    }
    this.itemService
      .createItem({
        _id: "",
        name: this.newItemForm.controls["name"].value,
        upc: this.newItemForm.controls["upc"].value,
        category_1: this.newItemForm.controls["category_1"].value,
        category_2: this.newItemForm.controls["category_2"].value,
        category_3: this.newItemForm.controls["category_3"].value,
        brand: this.newItemForm.controls["brand"].value.toUpperCase(),
        standard_price: this.newItemForm.controls["standard_price"].value,
        wholesale_cost: this.newItemForm.controls["wholesale_cost"].value,
        specifications: this.newItemForm.controls[
          "specifications"
        ].value.reduce(function (map, obj) {
          map[obj.key] = obj.value;
          return map;
        }, {}),
        features: this.newItemForm.controls["features"].value.map(
          (obj) => obj.value
        ),
        in_stock: this.newItemForm.controls["in_stock"].value,
      })
      .then((res) => {
        // reload the item list
        this.items.unshift(res);
        this.newItemForm.reset();
      });
  }

  editItem(item) {
    // enable item-details-form modal in edit mode
    console.log("opening item details form", item);
    this.clicked = !this.clicked;
    console.log(this.clicked);
    this.triggerItemDetailsModal();
  }

  triggerItemDetailsModal() {
    console.log("opening item details form");
    this.formTrigger.nativeElement.click();
  }
}
