import { Component, OnInit } from '@angular/core';
import {AuthenticationService} from "../../services/authentication.service";
import {Observable} from "rxjs";

@Component({
  selector: 'app-navbar',
  templateUrl: 'navbar.component.html',
  styleUrls: ['navbar.component.css']
})
export class NavbarComponent implements OnInit {

  loggedIn: Observable<boolean>;

  constructor(private auth: AuthenticationService) {
    this.loggedIn = this.auth.isLoggedIn;
  }

  ngOnInit() {
  }

}
