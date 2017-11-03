import { Component, OnInit } from '@angular/core';
import {AdminService} from "../../services/admin.service";
import {User} from "../../models/user";

@Component({
  selector: 'app-admin-users',
  templateUrl: './admin-users.component.html',
  styleUrls: ['./admin-users.component.css']
})
export class AdminUsersComponent implements OnInit {

  private users: User[];

  constructor(private adminService: AdminService) { }

  ngOnInit() {
    this.adminService.getUsers()
      .then(users => this.users = users);
  }

}
