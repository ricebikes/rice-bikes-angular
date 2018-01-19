import { Component, OnInit } from '@angular/core';
import {AdminService} from "../../services/admin.service";
import {User} from "../../models/user";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";

@Component({
  selector: 'app-admin-users',
  templateUrl: './admin-users.component.html',
  styleUrls: ['./admin-users.component.css']
})
export class AdminUsersComponent implements OnInit {

  private users: User[];
  private userForm: FormGroup;

  constructor(private adminService: AdminService, private fb: FormBuilder) { }

  ngOnInit() {
    this.userForm = this.fb.group({
      username: ['', Validators.required],
      admin: [false]
    });
    this.adminService.getUsers()
      .then(users => this.users = users);
  }

  postUser() {
    this.adminService.postUser(this.userForm.value['username'], this.userForm.value['admin'])
      .then(user => {
        this.userForm.reset();
        this.users.push(user);
      });
  }

  deleteUser(user: User) {
    this.adminService.deleteUser(user._id)
      .then(() => {
        let index = this.users.indexOf(user);
        if (index > -1) {
          this.users.splice(index, 1);
        }
      });
  }

}
