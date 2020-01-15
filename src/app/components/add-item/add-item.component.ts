import {Component, OnInit, ViewChild, ElementRef, Output, EventEmitter} from '@angular/core';
import {FormBuilder, FormControl} from '@angular/forms';
import {SearchService} from '../../services/search.service';
import {Item} from '../../models/item';
import {TransactionService} from '../../services/transaction.service';
import {Observable} from 'rxjs/Observable';



@Component({
  selector: 'app-add-item',
  templateUrl: 'add-item.component.html',
  styleUrls: ['add-item.component.css', '../../app.component.css']
})
export class AddItemComponent implements OnInit {
  // Emit this to the listening component
  @Output() chosenItem = new EventEmitter<Item>();

  // References to HTML elements
  @ViewChild('itemSearchClose') itemSearchClose: ElementRef;
  @ViewChild('searchTrigger') hiddenSearchTrigger: ElementRef;
  @ViewChild('nameInput') nameInput: ElementRef;
  @ViewChild('scanTrigger') scanTrigger: ElementRef;
  @ViewChild('scanInput') scanInput: ElementRef;


  itemForm = this.formBuilder.group({
    name: '',
    category: '',
    brand: '',
    condition: ''
  });

  scanData = new FormControl('');

  itemResults: Observable<Item[]>;

  categories = this.searchService.itemCategories();
  brands = this.searchService.itemBrands();

  constructor(
    private searchService: SearchService,
    private transactionService: TransactionService,
    private formBuilder: FormBuilder
  ) {
  }

  ngOnInit() {
    // watch form for changes, and search when it does
    this.itemResults = this.itemForm
      .valueChanges
      .debounceTime(200)
      .distinctUntilChanged()
      // switchMap swaps the current observable for a new one (the result of the item search)
      .switchMap(formData =>
        formData ? this.searchService.
        itemSearch(formData.name, formData.category, formData.brand, formData.condition)
          : Observable.of<Item[]>([]))
      .catch(err => {
        console.log(err);
        return Observable.of<Item[]>([]);
        }
      );
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

