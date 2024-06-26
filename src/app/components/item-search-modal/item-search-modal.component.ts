import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  Output,
  EventEmitter,
  Input,
} from "@angular/core";
import {
  FormBuilder,
} from "@angular/forms";
import { SearchService } from "../../services/search.service";
import { Item } from "../../models/item";
import { Observable } from "rxjs/Observable";

@Component({
  selector: "app-item-search-modal",
  templateUrl: "item-search-modal.component.html",
  styleUrls: ["item-search-modal.component.css", "../../app.component.css"],
})
export class ItemSearchModalComponent implements OnInit {
  // Input: if user is an employee or not
  @Input("employee") employee: boolean;
  @Input() modalClose: () => void;

  // Emit this to the listening component
  @Output() results = new EventEmitter<Item[]>();
  @Output() checked = new EventEmitter<boolean>();

  @ViewChild("itemSearchModal") itemSearchModal: ElementRef;

  itemForm = this.formBuilder.group({
    name: null,
    brand: null,
    category_1: null,
    category_2: null,
    category_3: null,
  });

  itemResults: Observable<Item[]>; // item results returned from backend

  categories = this.searchService.itemCategories1();
  categories2 = null;
  categories3 = null;

  brands = this.searchService.itemBrands();
  inStock = false;

  constructor(
    private searchService: SearchService,
    private formBuilder: FormBuilder
  ) { }

  ngOnInit() {
    // watch form for changes, and search when it does
    this.itemResults = this.itemForm.valueChanges
      .debounceTime(200) // wait 200ms between changes
      .distinctUntilChanged() // don't emit unless change is actually new data
      // switchMap swaps the current observable for a new one (the result of the item search)
      .switchMap((formData) => {
        return formData
          ? this.searchService.itemSearch(
            formData.name,
            formData.category_1,
            formData.category_2,
            formData.category_3,
            formData.brand
          )
          : Observable.of<Item[]>([]);
      })
      .catch((err) => {
        console.log(err);
        return Observable.of<Item[]>([]);
      });
    this.itemResults.subscribe((res) => {
      this.results.emit(res);
    });
  }

  // listens for changes to the item search filter and emits results to parent
  onChange() {
    this.itemResults.subscribe((res) => {
      this.results.emit(res);
    });
  }

  toggleInStock() {
    this.inStock = !this.inStock;
    this.checked.emit(this.inStock);
  }

  // load category 2 options when category 1 is selected/changed
  async onCat1Change(e) {
    this.categories2 = await this.searchService.itemCategories2(e.target.value);
    this.categories3 = null;
  }

  // load category 3 options when category 2 is selected/changed
  async onCat2Change(e) {
    this.categories3 = await this.searchService.itemCategories3(
      this.itemForm.controls["category_1"].value,
      e.target.value
    );
  }
}
