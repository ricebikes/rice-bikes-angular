import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {AuthenticationService, UserState} from '../../services/authentication.service';
import {User} from '../../models/user';
import {Observable} from 'rxjs/Observable';
import {CONFIG, user_timeout} from '../../config';
import {FormBuilder, FormGroup} from '@angular/forms';
import {AlertService} from '../../services/alert.service';

@Component({
  selector: 'app-user-tracker',
  templateUrl: './user-tracker.component.html',
  styleUrls: ['./user-tracker.component.css']
})
export class UserTrackerComponent implements OnInit {

  // access to net ID request modal through ViewChild
  @ViewChild('modalButton') hiddenModalTrigger: ElementRef;
  @ViewChild('requestNetIDModal') requestNetIdModal: ElementRef;
  @ViewChild('netIDInput') netIDInput: ElementRef;

  currentUser: User;
  userNameForm: FormGroup;
  userState: Observable<UserState>;
  timeout = user_timeout;
  badNetID = false;


  constructor(private authService: AuthenticationService, private formBuilder: FormBuilder) {}

  ngOnInit() {
    this.userState = this.authService.getUser();
    this.userState.subscribe((nextUserState) => {
      AlertService.debugLog('State Update');
      AlertService.debugLog(nextUserState);
      this.currentUser = nextUserState.user;
      if (nextUserState.state === 'waiting') {
        // trigger modal for user. We expect user to enter their net ID here.
        this.triggerModal();
      }
    });

    // set up form group
    this.userNameForm = this.formBuilder.group({
      userName: undefined
    });

  }


  triggerModal() {
    this.hiddenModalTrigger.nativeElement.click();
        // slight hack: bootstrap modal will grab focus, so we don't try grab focus on the input until 0.5 seconds
        // after we trigger the modal
        setTimeout(() => {
          this.netIDInput.nativeElement.focus();
        }, 500);
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
      let found = false;
      for (const user of userList) {
        if (user.username === userName) {
          found = true;
          this.setUser(user);
        }
      }
      this.badNetID = !found;
    });
  }

  setUser(newUser: User) {
    this.authService.setUser(newUser);
    // clear the text box in the modal
    this.userNameForm.get('userName').setValue(undefined);
    this.badNetID = false;
    // close the modal, since the user is set
    this.hiddenModalTrigger.nativeElement.click();
  }
}
