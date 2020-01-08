import {Component, OnInit, Input, ViewChild, ElementRef, Output, EventEmitter} from '@angular/core';
import {FormGroup, FormBuilder, Validators} from '@angular/forms';
import {SearchService} from '../../services/search.service';
import {Item} from '../../models/item';
import {TransactionService} from '../../services/transaction.service';
import {debounceTime, distinctUntilChanged, switchMap} from 'rxjs/operators';



@Component({
  selector: 'app-add-item',
  templateUrl: 'add-item.component.html',
  styleUrls: ['add-item.component.css', '../../app.component.css']
})
export class AddItemComponent implements OnInit {
  @Output() chosenItem = new EventEmitter<Item>();
  constructor(
    private searchService: SearchService,
    private formBuilder: FormBuilder
  ) {
  }

  searchForm = this.formBuilder.group({
    itemName: [''],
    upc: [''],
    category: [''],
    brand: [''],
    condition: ['']
  });

  ngOnInit() {
    // subscribe to form value changes, and update item list
    this.searchForm.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      // switch to new observable with item array
//      switchMap(formState => this.searchService.itemSearch(formState.))
    ).subscribe(console.log);
  }

  selectItem(item: Item) {
    this.chosenItem.emit(item);
  }
}

