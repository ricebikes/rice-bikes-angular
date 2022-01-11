import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AdminService } from '../../services/admin.service';
import { User } from '../../models/user';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-admin-users',
  templateUrl: './admin-users.component.html',
  styleUrls: ['./admin-users.component.css']
})
export class AdminUsersComponent implements OnInit {

  users: User[];
  userForm: FormGroup;
  editMode = false;
  editingUser: User;
  editIDX = 0;

  constructor(private adminService: AdminService, private fb: FormBuilder) { }

  ngOnInit() {
    this.userForm = this.fb.group({
      username: ['', Validators.required],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      active: [true],
      admin: [false],
      projects: [false],
      operations: [false],
    });
    this.adminService.getUsers()
      .then(users => this.users = users);
  }

  setEditMode(idx: number, enabled: boolean) {
    this.editMode = enabled;
    if (!enabled) {
      // Disable edit mode
      this.editIDX = 0;
      this.editingUser = null;
      this.userForm.reset();
      return;
    }
    this.editingUser = this.users[idx];
    this.editIDX = idx;
    // Fill the form so we can edit values
    this.userForm.get('username').setValue(this.editingUser.username);
    this.userForm.get('firstName').setValue(this.editingUser.firstname);
    this.userForm.get('lastName').setValue(this.editingUser.lastname);
    this.userForm.get('active').setValue(this.editingUser.active);
    this.userForm.get('admin').setValue(this.editingUser.roles.includes('admin'));
    this.userForm.get('projects').setValue(this.editingUser.roles.includes('projects'));
    this.userForm.get('operations').setValue(this.editingUser.roles.includes('operations'));
  }

  submitUserForm() {
    const userID = this.userForm.value['savedID'];
    const user_roles = [];
    if (this.userForm.value['admin']) { user_roles.push('admin'); }
    if (this.userForm.value['projects']) { user_roles.push('projects'); }
    if (this.userForm.value['operations']) { user_roles.push('operations'); }
    const active = this.userForm.value['active'];
    const username = this.userForm.value['username'];
    const lastName = this.userForm.value['lastName'];
    const firstName = this.userForm.value['firstName'];
    if (this.editMode) {
      this.updateUser(this.editingUser, username, firstName, lastName, user_roles, active);
    } else {
      this.postUser(username, firstName, lastName, user_roles);
    }
  }

  updateUser(user: User, username: string, firstName: string, lastName: string, roles: string[], active: Boolean) {
    this.adminService.updateUser(user, firstName, lastName, username, roles, active)
      .then(res => {
        this.users[this.editIDX] = <User>res
        this.setEditMode(0, false);
      });
  }


  postUser(username: string, firstName: string, lastName: string, roles: string[]) {
    this.adminService
      .createUser(firstName,
        lastName,
        username,
        roles)
      .then(res => this.users.unshift(res));
  }

}
