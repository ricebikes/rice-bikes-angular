import { Component, OnInit } from '@angular/core';
import {Validators, FormControl, FormGroup} from "@angular/forms";
import {AuthenticationService} from "../../services/authentication.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-login',
  templateUrl: 'login.component.html',
  styleUrls: ['login.component.css']
})
export class LoginComponent implements OnInit {

  user: any = {};
  loginForm: FormGroup;

  constructor(private authService: AuthenticationService, private router: Router) { }

  ngOnInit() {
    this.loginForm = new FormGroup({
      username: new FormControl(this.user.username, [
        Validators.required
      ]),
      password: new FormControl(this.user.password, [
        Validators.required
      ])
    });
  }

  private login(): void {
    this.authService.login(this.user.username, this.user.password)
      .then(res => this.router.navigate(['/transactions']));
  }



}
