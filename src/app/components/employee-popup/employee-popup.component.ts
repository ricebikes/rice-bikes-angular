import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {User} from '../../models/user';
import {SearchService} from '../../services/search.service';

@Component({
  selector: 'app-employee-popup',
  templateUrl: './employee-popup.component.html',
  styleUrls: ['./employee-popup.component.css']
})
export class EmployeePopupComponent implements OnInit {

  constructor(private searchService: SearchService) { }

  @Output() employee = new EventEmitter<User>();

  ngOnInit() {
    // grab focus for name entry here
  }


  emitUser(user: User) {
    // send a user back to parent component
    this.employee.emit(user);
  }

}
