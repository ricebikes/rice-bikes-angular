import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  Output,
  EventEmitter,
  Input,
  Pipe,
  PipeTransform,
} from "@angular/core";
import {
  FormBuilder,
  FormArray,
  FormControl,
  FormGroup,
  ValidatorFn,
  ValidationErrors,
  Validators,
} from "@angular/forms";
import { SearchService } from "../../services/search.service";
import { Item } from "../../models/item";
import { Observable } from "rxjs/Observable";
import { ItemService } from "../../services/item.service";
import { AuthenticationService } from "../../services/authentication.service";

@Component({
  selector: "app-add-item",
  templateUrl: "add-item.component.html",
  styleUrls: ["add-item.component.css", "../../app.component.css"],
})
export class AddItemComponent implements OnInit {
  // Input: if user is an employee or not
  @Input("employee") employee: boolean;
  // Emit this to the listening component
  @Output() chosenItem = new EventEmitter<Item>();

  // References to HTML elements
  @ViewChild("itemSearchClose") itemSearchClose: ElementRef;
  @ViewChild("searchTrigger") hiddenSearchTrigger: ElementRef;
  @ViewChild("nameInput") nameInput: ElementRef;
  @ViewChild("scanTrigger") scanTrigger: ElementRef;
  @ViewChild("scanInput") scanInput: ElementRef;

  itemForm = this.formBuilder.group({
    name: null,
    brand: null,
    category_1: null,
    category_2: null,
    category_3: null,
  });

  newItemForm = this.formBuilder.group({
    name: ["", Validators.required],
    brand: ["", Validators.required],
    standard_price: ["", [Validators.required, Validators.pattern("^[0-9]*$")]],
    upc: ["", [Validators.required, Validators.pattern("[0-9]+")]],
    category_1: ["", Validators.required],
    category_2: "",
    category_3: "",
    wholesale_cost: ["", [Validators.required, Validators.pattern("^[0-9]*$")]],
    specifications: this.formBuilder.array([]),
    features: this.formBuilder.array([]),
  });

  scanData = new FormControl(
    "",
    Validators.compose([Validators.required, Validators.pattern("[0-9]+")])
  );

  itemResults: Observable<Item[]>; // item results returned from backend

  addDialog = false;
  isAdmin = this.authenticationService.isAdmin;

  categories = this.searchService.itemCategories();
  brands = this.searchService.itemBrands();

  constructor(
    private searchService: SearchService,
    private formBuilder: FormBuilder,
    private itemService: ItemService,
    private authenticationService: AuthenticationService
  ) {}

  get specifications() {
    return this.newItemForm.controls["specifications"] as FormArray;
  }

  get features() {
    return this.newItemForm.controls["features"] as FormArray;
  }

  createEmpFormGroup() {
    return this.formBuilder.group({
      key: ["", Validators.required],
      value: ["", Validators.required],
    });
  }

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
              null,
              formData.brand
            )
          : Observable.of<Item[]>([]);
      })
      .catch((err) => {
        console.log(err);
        return Observable.of<Item[]>([]);
      });
  }

  /**
   * Lets the item search copy any entered data into the create item component
   */
  copyIntoItemForm() {
    for (const controlValue of [
      "name",
      "category_1",
      "category_2",
      "category_3",
      "size",
      "brand",
    ]) {
      if (
        this.itemForm.get(controlValue) &&
        this.itemForm.get(controlValue).value
      ) {
        this.newItemForm
          .get(controlValue)
          .setValue(this.itemForm.get(controlValue).value);
      }
    }
  }

  addSpec() {
    this.specifications.push(this.createEmpFormGroup());
  }

  removeSpec(index: number) {
    this.specifications.removeAt(index);
  }

  addFeature() {
    this.features.push(
      this.formBuilder.group({ value: ["", Validators.required] })
    );
  }

  removeFeature(index: number) {
    this.features.removeAt(index);
  }
  /**
   * Submits the item creation form, and creates the item
   */
  submitItemCreateForm() {
    this.itemService
      .createItem({
        _id: "",
        name: this.newItemForm.controls["name"].value,
        upc: this.newItemForm.controls["upc"].value,
        category_1: this.newItemForm.controls["category_1"].value,
        category_2: this.newItemForm.controls["category_2"].value,
        category_3: this.newItemForm.controls["category_3"].value,
        brand: this.newItemForm.controls["brand"].value,
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
      })
      .then((res) => {
        this.newItemForm.reset();
        this.chosenItem.emit(res);
      });
  }

  /**
   * Triggered when the scan dialog gets a UPC, followed by the enter key
   */
  addByUPC() {
    if (this.scanData.invalid || this.scanData.value == "") {
      return;
    }
    this.searchService.upcSearch(this.scanData.value).then((item) => {
      if (item) {
        this.chosenItem.emit(item);
        this.scanData.reset();
        // dismiss scan modal
        this.scanTrigger.nativeElement.click();
      } else {
        this.scanData.setErrors({ badUPC: "true" });
        return;
      }
    });
  }

  triggerItemSearch() {
    // simply opens the item search, waits for the modal to grab focus, then shifts it to the item name input
    this.hiddenSearchTrigger.nativeElement.click();
    setTimeout(() => this.nameInput.nativeElement.focus(), 500);
  }

  triggerScanModal() {
    // trigger the scan modal
    this.scanTrigger.nativeElement.click();
    // keeping timeout in case it needs to be raise but it appears to not be required if the modal does not fade
    // timeout works as 0 ms, but keeping a small buffer just in case
    setTimeout(() => this.scanInput.nativeElement.focus(), 50);
  }

  /**
   * Selects an item, returns it to parent component
   * @param item: Item to return
   */
  selectItem(item: Item) {
    this.chosenItem.emit(item);
    this.itemSearchClose.nativeElement.click();
  }
}
