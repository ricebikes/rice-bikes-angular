import { Component, OnInit } from '@angular/core';
import {Validators, FormControl, FormGroup} from "@angular/forms";
import {AuthenticationService} from "../../services/authentication.service";
import {Router, ActivatedRoute} from "@angular/router";

@Component({
  selector: 'app-login',
  templateUrl: 'login.component.html',
  styleUrls: ['login.component.css']
})
export class LoginComponent implements OnInit {

  user: any = {username: '', password: ''};
  loginForm: FormGroup;
  returnUrl: string;
  error: boolean = false;

  constructor(private authService: AuthenticationService, private router: Router, private route: ActivatedRoute) { }

  ngOnInit() {
    this.authService.logout();
    this.loginForm = new FormGroup({
      username: new FormControl(this.user.username, [
        Validators.required
      ]),
      password: new FormControl(this.user.password, [
        Validators.required
      ])
    });

    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  private login(): void {
    this.authService.login(this.loginForm.value['username'], this.loginForm.value['password'])
      .catch(err => this.error = true)
      .then(res => this.router.navigate([this.returnUrl]));
  }
}
