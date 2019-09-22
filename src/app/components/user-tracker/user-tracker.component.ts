import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {AuthenticationService, UserState} from '../../services/authentication.service';
import {User} from '../../models/user';
import {Subject} from 'rxjs/Subject';
import {Observable} from 'rxjs/Observable';
import {CONFIG} from '../../config';
import {FormBuilder, FormGroup} from '@angular/forms';

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
  private userNameForm: FormGroup;
  private userState: Observable<UserState>;
  private timeout = CONFIG.user_timeout;

  userResults: Observable<User[]>;

  constructor(private authService: AuthenticationService, private formBuilder: FormBuilder) {}

  ngOnInit() {
    this.userState = this.authService.getUser();
    this.userState.subscribe((nextUserState) => {
      console.log('State update!');
      console.log(nextUserState);
      this.currentUser = nextUserState.user;
      if (nextUserState.state === 'waiting') {
        // trigger modal for user. We expect user to enter their net ID here.
        this.hiddenModalTrigger.nativeElement.click();
      }
    });

    // set up form group
    this.userNameForm = this.formBuilder.group({
      userName: undefined
    });

    this.userNameForm.get('userName').valueChanges.debounceTime(300).subscribe(term => {
      this.authService.userList().then(userList => {
        this.userResults = Observable.of(userList.filter(
          user => user.username.toLowerCase().includes(term.toLowerCase()) && term.length > 0));
      });
    });
  }

  stopTimer() {
    this.authService.resetTimer();
  }

  /**
   * Attempts to set a new user, given only their username.
   * Will fail silently if the text given is not a user
   */
  attemptSetUser() {
    const userName = this.userNameForm.get('userName').value;

    this.authService.userList().then(userList => {
      for (const user of userList) {
        if (user.username === userName) {
          console.log('Valid user provided');
          this.setUser(user);
        }
      }
    });
  }

  setUser(newUser: User) {
    this.authService.setUser(newUser);
    // clear the text box in the modal
    this.userNameForm.get('userName').setValue(undefined);
    this.userResults = Observable.of([]);
    // close the modal, since the user is set
    this.hiddenModalTrigger.nativeElement.click();
  }
}
