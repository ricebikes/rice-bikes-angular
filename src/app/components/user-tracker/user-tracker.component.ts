import { Component, OnInit } from '@angular/core';
import {AuthenticationService, UserState} from '../../services/authentication.service';

@Component({
  selector: 'app-user-tracker',
  templateUrl: './user-tracker.component.html',
  styleUrls: ['./user-tracker.component.css']
})
export class UserTrackerComponent implements OnInit {

  private stateUser: UserState;

  constructor(private authService: AuthenticationService) {}

  ngOnInit() {
    this.authService.getUser().subscribe((next) => {
      console.log(next);
      if (next.state === 'waiting') {
        this.authService.userList().then((list) => {
          console.log('Setting user' + list[0]);
          this.authService.setUser(list[0]);
        });
      }
    });
  }

}
