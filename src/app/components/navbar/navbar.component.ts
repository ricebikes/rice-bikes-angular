import { Component, OnInit } from '@angular/core';
import {AuthenticationService} from "../../services/authentication.service";
import {Observable} from "rxjs";
import {Router, ActivatedRoute} from "@angular/router";

@Component({
  selector: 'app-navbar',
  templateUrl: 'navbar.component.html',
  styleUrls: ['navbar.component.css']
})
export class NavbarComponent implements OnInit {

  loggedIn: Observable<boolean>;

  constructor(private auth: AuthenticationService, private router: Router, private route: ActivatedRoute) {
    this.loggedIn = this.auth.isLoggedIn;
  }

  ngOnInit() {
  }

  logout() {
    this.auth.logout().then(ret => this.router.navigate(['/login']));
  }

}
