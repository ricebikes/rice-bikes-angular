import { Injectable } from '@angular/core';
import { Http } from "@angular/http";

@Injectable()
export class AuthenticationService {

  private authUrl: string = 'http://localhost:3000/authenticate';

  constructor(private http: Http) {}

  public login(username: String, password: String): Promise<any> {
    return this.http.post(this.authUrl, {username: username, password: password})
      .toPromise()
      .then(res => {
        let user = res.json();
        if (user && user.token) {
          localStorage.setItem('currentUser', JSON.stringify(user));
        }
      })
  }

  public logout(): void {
    localStorage.removeItem('currentUser');
  }

}
