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
  Renderer2,
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
  @ViewChild("scanModal") scanModal: ElementRef;
  @ViewChild("scanInput") scanInput: ElementRef;
  @ViewChild("itemSearchModal") itemSearchModal: ElementRef;
  @ViewChild("searchButton") searchButton: ElementRef;

  itemForm = this.formBuilder.group({
    name: null,
    brand: null,
    category_1: null,
    category_2: null,
    category_3: null,
  });

  scanData = new FormControl(
    "",
    Validators.compose([Validators.required, Validators.pattern("[0-9]+")])
  );

  itemResults: Observable<Item[]>; // item results returned from backend

  addDialog = false;
  createItemFromUPC = false;

  isAdmin = this.authenticationService.isAdmin;

  category1 = "";
  categories = this.searchService.itemCategories1();
  categories2 = this.searchService.itemCategories2();
  categories3 = null;

  brands = this.searchService.itemBrands();

  searchingForUPC = false;
  activeButton = "search";

  lastUPC = "";
  close = false;

  setActive = function (buttonName) {
    this.activeButton = buttonName;
    if (buttonName == "search") this.addDialog = false;
    else this.addDialog = true;
  };

  isActive = function (buttonName) {
    return this.activeButton === buttonName;
  };

  scanToCreateItem = function () {
    this.createItemFromUPC = true;
  };

  constructor(
    private searchService: SearchService,
    private formBuilder: FormBuilder,
    private itemService: ItemService,
    private authenticationService: AuthenticationService,
    private renderer: Renderer2
  ) {
    this.renderer.listen("window", "click", (e: Event) => {
      if (e.target == this.itemSearchModal.nativeElement) {
        this.itemForm.reset();
        this.closeAndResetAll("clicked out of modal");
      }
    });
    this.renderer.listen("window", "click", (e: Event) => {
      if (e.target == this.scanModal.nativeElement) {
        this.scanData.reset();
        this.itemForm.reset();
        this.createItemFromUPC = false;
        this.closeAndResetAll("clicked out of modal");
      }
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
              null,
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
  }

  addItem(item: Item) {
    console.log("add item component called");
    this.scanData.reset();
    this.createItemFromUPC = false;
    this.chosenItem.emit(item);
  }

  isSearching() {
    return this.searchingForUPC;
  }

  onCat1Change(e) {
    this.category1 = e.target.value;
    this.categories2 = this.searchService.itemCategories2(e.target.value);
  }

  onCat2Change(e) {
    this.categories3 = this.searchService.itemCategories3(
      this.category1,
      e.target.value
    );
  }
  /**
   * Triggered when the scan dialog gets a UPC, followed by the enter key
   */
  addByUPC() {
    this.searchingForUPC = true;
    this.scanData.disable();
    if (this.scanData.invalid || this.scanData.value == "") {
      this.searchingForUPC = false;
      return;
    }

    this.searchService.upcSearch(this.scanData.value).then(
      (item) => {
        this.searchingForUPC = false;
        this.scanData.enable();
        if (item) {
          this.chosenItem.emit(item);
          this.scanData.reset();
          // dismiss scan modal
          this.scanTrigger.nativeElement.click();
        } else {
          this.lastUPC = this.scanData.value;
          this.resetUPC();
          this.scanData.reset();
          this.scanData.setErrors({ badUPC: "true" });
          return;
        }
      },
      (err) => {
        this.lastUPC = this.scanData.value;
        this.searchingForUPC = false;
        this.resetUPC();
        this.scanData.reset();
        this.scanData.setErrors({ unexpectedError: "true" });
      }
    );
  }

  resetUPC = function () {
    this.scanData.reset();
    setTimeout(() => this.scanInput.nativeElement.focus());
  };

  closeAndResetAll(message: string) {
    console.log("emitted", message, "from item details form component");
    this.close = !this.close;
    this.setActive("search");
    this.createItemFromUPC = false;
    this.itemForm.reset();
    this.searchButton.nativeElement.click();
    this.resetUPC();
  }

  triggerItemSearch() {
    console.log("opening item search");
    // simply opens the item search, waits for the modal to grab focus, then shifts it to the item name input
    this.hiddenSearchTrigger.nativeElement.click();
    setTimeout(() => this.nameInput.nativeElement.focus(), 500);
  }

  triggerScanModal() {
    // trigger the scan modal
    this.scanTrigger.nativeElement.click();

    // keeping timeout in case it needs to be raise but it appears to not be required if the modal does not fade
    // timeout works as 0 ms, but keeping a small buffer just in case
    setTimeout(() => this.scanInput.nativeElement.focus());
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
