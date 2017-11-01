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

  private loggedIn: Observable<boolean>;
  private authUrl: string = `${CONFIG.cas_auth_url}?service=${CONFIG.service_url}`;

  constructor(private auth: AuthenticationService,
              private router: Router,
              private route: ActivatedRoute) {
  }

  ngOnInit() {
    this.loggedIn = this.auth.isLoggedIn;
  }

  logout() {
    this.auth.logout().then(ret => this.router.navigate(['/login']));
  }

}
