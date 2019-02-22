import {Component, OnInit, Input, ViewChild, ElementRef} from '@angular/core';
import {FormGroup, FormBuilder, Validators} from '@angular/forms';
import {Subject, Observable} from 'rxjs';
import {SearchService} from '../../services/search.service';
import {Item} from '../../models/item';
import {Transaction} from '../../models/transaction';
import {TransactionService} from '../../services/transaction.service';



@Component({
  selector: 'app-add-item',
  templateUrl: 'add-item.component.html',
  styleUrls: ['add-item.component.css', '../../app.component.css']
})
export class AddItemComponent implements OnInit {
  @Input() transaction: Transaction;
  @ViewChild('searchModal') itemSearchModal: ElementRef;

  searchFieldValue: string;
  itemSearchForm: FormGroup;
  itemResults: Observable<Item[]>;
  private searchTerms = new Subject<string>();
  search_categories: String[];
  search_sizes: String[];
  search_results: Item[];
  selectedItem: Item;


  constructor(
    private searchService: SearchService,
    private transactionService: TransactionService,
    private formBuilder: FormBuilder
  ) { }

  ngOnInit() {
    this.itemResults = this.searchTerms
      .debounceTime(300)
      .distinctUntilChanged()
      .switchMap(term => term
        ? this.searchService.itemSearch(term)
        : Observable.of<Item[]>([]))
      .catch(err => {
        console.log(err);
        return Observable.of<Item[]>([]);
      });
    // build form for item search
    this.itemSearchForm = this.formBuilder.group({
      search_options: this.formBuilder.group({
        item_category: undefined,
        item_size: undefined,
        item_name: undefined,
      }),
      selectedItem: [undefined, Validators.required]
    });
    // populate the categories of the component
    this.searchService.itemCategories()
      .then(categories => {
        // put an undefined value first to allow searching for all items
        this.search_categories = categories;
        this.itemSearchForm.get('search_options').get('item_category').setValue(categories[0]);
        });
    // subscribe for form changes
    this.listenForChanges();
  }


  listenForChanges(): void {
    // allows us to update the size options
    this.itemSearchForm.get('search_options').get('item_category').valueChanges
      .debounceTime(100).distinctUntilChanged().subscribe(
      newValue => {
        // update the sizes menu to reflect the sizes for this category
        this.searchService.itemSizes(newValue)
          .then(newSizes => {
            this.search_sizes = newSizes;
            this.itemSearchForm.get('search_options').get('item_size').setValue(newSizes[0]);
          });
      }
    );
    // subscribe to entire form so we can update the item results
    // updates advanced search box
  const update_handler = {
    next: updatedForm => {
      this.searchService.itemSearch(
        updatedForm.item_name,
        updatedForm.item_category,
        updatedForm.item_size
      ).toPromise()
        .then(items => this.search_results = items);
    }
  };
    this.itemSearchForm.get('search_options').valueChanges
      .distinctUntilChanged().debounceTime(300).subscribe(update_handler);
  }

  search(term: string): void {
    this.searchTerms.next(term);
  }

  addItem(item: Item): void {
    this.transactionService.addItemToTransaction(this.transaction._id, item._id)
      .then(() => {
        this.searchTerms.next('');
        this.searchFieldValue = '';
      });
  }

  addItemFromModal(): void {
    console.log('Trying to add item');
    const item = this.itemSearchForm.get('selectedItem').value[0];
    console.log(item);
    this.transactionService.addItemToTransaction(this.transaction._id, item._id) .then(() => {
      this.itemSearchModal.nativeElement.click();
    });
  }

}
