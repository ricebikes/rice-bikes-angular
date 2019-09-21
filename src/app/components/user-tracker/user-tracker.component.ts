import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {AuthenticationService, UserState} from '../../services/authentication.service';
import {User} from '../../models/user';
import {Subject} from 'rxjs/Subject';
import {Observable} from 'rxjs/Observable';

@Component({
  selector: 'app-user-tracker',
  templateUrl: './user-tracker.component.html',
  styleUrls: ['./user-tracker.component.css']
})
export class UserTrackerComponent implements OnInit {

  // access to net ID request modal through ViewChild
  @ViewChild('modalButton') hiddenModalTrigger: ElementRef;
  @ViewChild('requestNetIDModal') requestNetIdModal: ElementRef;

  private currentUser: User;

  userResults: Observable<User[]>;
  private userSearch: Subject<String> = new Subject<String>();

  constructor(private authService: AuthenticationService) {}

  ngOnInit() {
    this.authService.getUser().subscribe((nextUserState) => {
      this.currentUser = nextUserState.user;
      if (nextUserState.state === 'waiting') {
        this.authService.userList().then((list) => {
          // trigger modal for user. We expect user to enter their net ID here.
          this.hiddenModalTrigger.nativeElement.click();
        });
      }
    });

    // set up user search
    this.userSearch.debounceTime(300).subscribe(term => {
      this.authService.userList().then(userList => {
        this.userResults = Observable.of(userList.filter(
          user => user.username.toLowerCase().includes(term.toLowerCase()) && term.length > 0));
      });
    });
  }

  setUser(newUser: User) {
    this.authService.setUser(newUser);
    // close the modal, since the user is set
    this.requestNetIdModal.nativeElement.click();
  }

  search(term: String) {
    this.userSearch.next(term);
  }
}
