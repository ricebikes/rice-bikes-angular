import { Component, OnInit } from '@angular/core';
import {AuthenticationService} from '../../services/authentication.service';
import {ActivatedRoute, Router} from '@angular/router';

@Component({
  selector: 'app-auth',
  templateUrl: 'auth.component.html',
  styleUrls: ['auth.component.css']
})
export class AuthComponent implements OnInit {

  constructor(private authService: AuthenticationService, private route: ActivatedRoute, private router: Router) { }

  ngOnInit() {
    /* when we navigate to the auth component, it will make a request
     * to the authservice to authenticate us with rice idp
     */
    this.route.queryParams.subscribe(params => {
      this.authService.authenticate(params['ticket'])
        .catch(err => console.log(err))
        .then(() => {
          this.router.navigate(['/transactions']);
        });
    });
  }

}
