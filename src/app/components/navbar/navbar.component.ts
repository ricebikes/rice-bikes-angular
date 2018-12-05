import { Component, OnInit } from '@angular/core';
import {AuthenticationService} from "../../services/authentication.service";
import {Observable} from "rxjs";
import {Router, ActivatedRoute} from "@angular/router";
import {CONFIG} from "../../config";

@Component({
  selector: 'app-navbar',
  templateUrl: 'navbar.component.html',
  styleUrls: ['navbar.component.css']
})
export class NavbarComponent implements OnInit {

  loggedIn: Observable<boolean>;
  isAdmin: Observable<boolean>;
  authUrl: string = `${CONFIG.cas_auth_url}?service=${CONFIG.service_url}`;

  constructor(private auth: AuthenticationService,
              private router: Router,
              private route: ActivatedRoute) {
  }

  ngOnInit() {
    this.loggedIn = this.auth.isLoggedIn;
    this.isAdmin = this.auth.isAdmin;
  }

  logout() {
    this.auth.logout().then(ret => window.location.href="https://idp.rice.edu/idp/profile/cas/logout");
  }
}
