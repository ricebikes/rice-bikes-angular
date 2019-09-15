import { Injectable } from '@angular/core';
import {AdminService} from './admin.service';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {User} from '../models/user';
import {Headers, RequestOptions} from '@angular/http';

/*
  Provides tracking of the current user in application.
 */
@Injectable()
export class ActiveUserService {

  private _currentUser: User;

  constructor(private  userManager: AdminService) {}


  setUser(updatedUser: User) {
    this._currentUser = updatedUser;
  }

  getUser(): User {
    return this._currentUser;
  }

  userList(): Promise<any> {
    return this.userManager.getUsers();
  }

  public userHeader() {
    const headers = new Headers({'user-id': this._currentUser._id});
    return new RequestOptions({headers: headers});
  }
}
