import {Component, OnInit, ViewChild, ElementRef, Output, EventEmitter, Input} from '@angular/core';
import {FormBuilder, FormControl, Validators} from '@angular/forms';
import {SearchService} from '../../services/search.service';
import {Item} from '../../models/item';
import {Observable} from 'rxjs/Observable';



@Component({
  selector: 'app-add-item',
  templateUrl: 'add-item.component.html',
  styleUrls: ['add-item.component.css', '../../app.component.css']
})
export class AddItemComponent implements OnInit {
  // Input: if user is an employee or not
  @Input('employee') employee: boolean;
  // Emit this to the listening component
  @Output() chosenItem = new EventEmitter<Item>();

  // References to HTML elements
  @ViewChild('itemSearchClose') itemSearchClose: ElementRef;
  @ViewChild('searchTrigger') hiddenSearchTrigger: ElementRef;
  @ViewChild('nameInput') nameInput: ElementRef;
  @ViewChild('scanTrigger') scanTrigger: ElementRef;
  @ViewChild('scanInput') scanInput: ElementRef;


  itemForm = this.formBuilder.group({
    name: null,
    category: null,
    size: null,
    brand: null,
    condition: null
  });

  newItemForm = this.formBuilder.group({
    name: [Validators.required],
    category: [Validators.required],
    size: [Validators.required],
    brand: [Validators.required],
    condition: [Validators.required],
    desired_stock: [Validators.required],
    upc: [Validators.required],
    standard_price: [Validators.required],
    wholesale_cost: [Validators.required]
  });

  scanData = new FormControl('');

  itemResults: Observable<Item[]>; // item results returned from backend
  availableSizes: Observable<String[]>; // filled when we select a category
  addDialog = false;

  categories = this.searchService.itemCategories();
  brands = this.searchService.itemBrands();

  constructor(
    private searchService: SearchService,
    private formBuilder: FormBuilder
  ) {
  }


  ngOnInit() {
    // watch form for changes, and search when it does
    this.itemResults = this.itemForm
      .valueChanges
      .debounceTime(200) // wait 200ms between changes
      .distinctUntilChanged() // don't emit unless change is actually new data
      // switchMap swaps the current observable for a new one (the result of the item search)
      .switchMap(formData => {
        console.log(formData);
        return formData ? this.searchService.
        itemSearch(formData.name, formData.category, formData.size,
          formData.brand, formData.condition) : Observable.of<Item[]>([]);
      })
      .catch(err => {
        console.log(err);
        return Observable.of<Item[]>([]);
        }
      );
    // Setup availableSizes to watch for changes to the category, and update with possible sizes.
    this.availableSizes = this.itemForm.controls['category'] // listen for changes to the item category
      .valueChanges
      .debounceTime(200) // wait 200ms between changes
      .distinctUntilChanged() // don't emit unless change is actually new data
      .switchMap(newCategory => {
        console.log(newCategory);
          // switch to promise from backend request with our category
          this.itemForm.controls['size'].setValue('');
          return this.searchService.itemSizes(newCategory);
      })
      .catch(err => {
        console.log(err);
        return Observable.of([]);
      });
  }

  /**
   * Selects between the add item and search item dialog
   * @param choice: if true, choose add item dialog, if false chose search item dialog
   */
  setAddDialog(choice: boolean) {
    this.addDialog = choice;
  }

  /**
   * Triggered when the scan dialog gets a UPC, followed by the enter key
   */
  addByUPC() {
    this.searchService.upcSearch(this.scanData.value).then(items => {
      if (items.length > 0) {
        this.chosenItem.emit(items[0]);
      }
    });
    // dismiss scan modal
    this.scanTrigger.nativeElement.click();
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
    this.itemForm.reset();
  }
}

