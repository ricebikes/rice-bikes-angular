import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-search-transaction',
  templateUrl: 'search-transaction.component.html',
  styleUrls: ['search-transaction.component.css']
})
export class SearchTransactionComponent implements OnInit {

  searchChoices: string[] = ['Customer', 'Bike', 'Description'];
  currentChoice: string = this.searchChoices[0];

  constructor() { }

  ngOnInit() {
  }

  setSearchChoice(choice: string): void {
    this.currentChoice = choice;
  }

}
