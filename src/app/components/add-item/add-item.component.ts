import {Component, OnInit, Input, ViewChild, ElementRef, Output, EventEmitter} from '@angular/core';
import {FormGroup, FormBuilder, Validators} from '@angular/forms';
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
  @Output() chosenItem = new EventEmitter<Item>();
  itemForm = this.formBuilder.group({
    name: '',
    upc: '',
    category: '',
    brand: '',
    condition: ''
  });

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
        itemSearch(formData.name, formData.upc, formData.category, formData.brand, formData.condition)
          : Observable.of<Item[]>([]))
      .catch(err => {
        console.log(err);
        return Observable.of<Item[]>([]);
        }
      );
  }

  /**
   * Selects an item, returns it to parent component
   * @param item: Item to return
   */
  selectItem(item: Item) {
    this.chosenItem.emit(item);
  }
}

