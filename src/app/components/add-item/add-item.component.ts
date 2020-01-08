import {Component, OnInit, Input, ViewChild, ElementRef, Output, EventEmitter} from '@angular/core';
import {FormGroup, FormBuilder, Validators} from '@angular/forms';
import {SearchService} from '../../services/search.service';
import {Item} from '../../models/item';
import {TransactionService} from '../../services/transaction.service';



@Component({
  selector: 'app-add-item',
  templateUrl: 'add-item.component.html',
  styleUrls: ['add-item.component.css', '../../app.component.css']
})
export class AddItemComponent implements OnInit {
  @Output() chosenItem = new EventEmitter<Item>();
  constructor(
    private searchService: SearchService,
    private transactionService: TransactionService,
    private formBuilder: FormBuilder
  ) {
  }

  ngOnInit() {

  }

  selectItem(item: Item) {
    this.chosenItem.emit(item);
  }
}

