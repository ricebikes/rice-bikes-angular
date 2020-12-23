import {Component, OnInit, ViewChild, ElementRef, Output, EventEmitter, Input} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, ValidatorFn, Validators} from '@angular/forms';
import {SearchService} from '../../services/search.service';
import {Item} from '../../models/item';
import {Observable} from 'rxjs/Observable';
import {ItemService} from '../../services/item.service';
import {AuthenticationService} from '../../services/authentication.service';



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

  // Form validator that enforces requirement that any "new" item must have a UPC.
  private newItemFormUPCValidator: ValidatorFn = (fg: FormGroup) => {
    const upcFilled = fg.get('upc').value != '';
    return upcFilled || fg.get('condition').value != 'New' ? null : {upc: true};
  }

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
  }, {validator: this.newItemFormUPCValidator});

  scanData = new FormControl('');

  itemResults: Observable<Item[]>; // item results returned from backend
  availableSizes: Observable<String[]>; // filled when we select a category

  addDialog = false;

  isAdmin = this.authenticationService.isAdmin;

  existingSizes: Observable<String[]>; // for use in add item dialog
  categories = this.searchService.itemCategories();
  brands = this.searchService.itemBrands();

  constructor(
    private searchService: SearchService,
    private formBuilder: FormBuilder,
    private itemService: ItemService,
    private authenticationService: AuthenticationService
  ) { }


  ngOnInit() {
    // watch form for changes, and search when it does
    this.itemResults = this.itemForm
      .valueChanges
      .debounceTime(200) // wait 200ms between changes
      .distinctUntilChanged() // don't emit unless change is actually new data
      // switchMap swaps the current observable for a new one (the result of the item search)
      .switchMap(formData => {
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
          // switch to promise from backend request with our category
          this.itemForm.controls['size'].setValue('');
          return this.searchService.itemSizes(newCategory);
      })
      .catch(err => {
        console.log(err);
        return Observable.of([]);
      });
    this.existingSizes = this.newItemForm.controls['category']
      .valueChanges
      .debounceTime(200)
      .distinctUntilChanged()
      .switchMap(newCategory => this.searchService.itemSizes(newCategory));
  }

  /**
   * Lets the item search copy any entered data into the create item component
   */
  copyIntoItemForm() {
    for (const controlValue of ['name', 'category', 'size', 'brand']) {
      if (this.itemForm[controlValue].value) {
        this.newItemForm.controls[controlValue].setValue(this.itemForm[controlValue].value);
      }
    }
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
      this.newItemForm.reset();
      this.chosenItem.emit(res);
    });
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

