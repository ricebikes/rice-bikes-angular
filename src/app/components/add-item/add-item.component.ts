import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  Output,
  EventEmitter,
  Input,
  Renderer2,
} from "@angular/core";
import {
  FormBuilder,
  FormControl,
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
  @Output() chosenWhiteboardItem = new EventEmitter<Item>();

  // References to HTML elements
  @ViewChild("itemSearchClose") itemSearchClose: ElementRef;
  @ViewChild("searchTrigger") hiddenSearchTrigger: ElementRef;
  @ViewChild("nameInput") nameInput: ElementRef;
  @ViewChild("scanTrigger") scanTrigger: ElementRef;
  @ViewChild("scanModal") scanModal: ElementRef;
  @ViewChild("scanInput") scanInput: ElementRef;
  @ViewChild("itemSearchModal") itemSearchModal: ElementRef;
  @ViewChild("searchButton") searchButton: ElementRef;

  isAdmin = this.authenticationService.isAdmin;

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

  whiteboard = false;
  addDialog = false;
  createItemFromUPC = false;
  qbpItem = null;

  categories = this.searchService.itemCategories1();
  categories2 = null;
  categories3 = null;

  brands = this.searchService.itemBrands();

  searchingForUPC = false;
  activeButton = "search";
  lastUPC = "";
  close = false;

  constructor(
    private searchService: SearchService,
    private formBuilder: FormBuilder,
    private itemService: ItemService,
    private authenticationService: AuthenticationService,
    private renderer: Renderer2
  ) {
    this.renderer.listen("window", "click", (e: Event) => {
      if (e.target == this.itemSearchModal.nativeElement) {
        this.closeAndResetAll("clicked out of modal");
      }
    });
    this.renderer.listen("window", "click", (e: Event) => {
      if (e.target == this.scanModal.nativeElement) {
        this.scanData.reset({ emitEvent: false });
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

  addItem(item: Item) {
    this.scanData.reset();
    this.createItemFromUPC = false;
    if (this.whiteboard) {
      this.chosenWhiteboardItem.emit(item);
    }
    else {
      this.chosenItem.emit(item);
    }
  }

  isSearching() {
    return this.searchingForUPC;
  }

  async onCat1Change(e) {
    this.categories2 = await this.searchService.itemCategories2(e.target.value);
    this.categories3 = null;
  }

  async onCat2Change(e) {
    this.categories3 = await this.searchService.itemCategories3(
      this.itemForm.controls["category_1"].value,
      e.target.value
    );
  }

  /**
   * Triggered when the scan dialog gets a UPC, followed by the enter key
   */
  addByUPC() {
    console.log("addbyupc")

    this.searchingForUPC = true;
    this.scanData.disable();
    if (this.scanData.invalid || this.scanData.value == "") {
      this.searchingForUPC = false;
      return;
    }

    this.searchService.upcSearch(this.scanData.value).then(
      (item) => {
        console.log("item", item);
        this.searchingForUPC = false;
        this.scanData.enable();
        if (item) {
          // if qbp generated with no categories, prompt to fill out
          if (!item.category_1) {
            console.log("open item create modal", item);
            // fill out the item modal
            this.qbpItem = item;
            this.scanToCreateItem();
          } else {
            this.qbpItem = null
            this.chosenItem.emit(item);
            this.scanData.reset();
            // dismiss scan modal
            this.scanTrigger.nativeElement.click();
          }
        } else {
          this.qbpItem = null;
          this.lastUPC = this.scanData.value;
          this.resetUPC();
          this.scanData.reset();
          this.scanData.setErrors({ badUPC: "true" });
          return;
        }
      },
      (err) => {
        console.log(this.scanData.value);
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
    this.itemForm.reset({}, { emitEvent: false });
    this.categories2 = null;
    this.categories3 = null;
    this.searchButton.nativeElement.click();
    this.resetUPC();
  }

  triggerItemSearch(mode = null) {
    console.log('mode', mode)

    if (mode == 'whiteboard') {
      this.whiteboard = true;
    } else {
      this.whiteboard = false;
    }
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
    if (this.whiteboard) {
      console.log('whiteboard', item)
      this.chosenWhiteboardItem.emit(item);
    }
    else {
      console.log('not whiteboard', item);
      this.chosenItem.emit(item);
    }
    this.itemSearchClose.nativeElement.click();
  }
}
