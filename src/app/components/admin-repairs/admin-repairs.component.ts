import { Component, OnInit } from '@angular/core';
import {Repair} from '../../models/repair';
import {RepairService} from '../../services/repair.service';


@Component({
  selector: 'app-admin-repairs',
  templateUrl: './admin-repairs.component.html',
  styleUrls: ['./admin-repairs.component.css']
})
export class AdminRepairsComponent implements OnInit {

  repairs: Repair[];
  editable_repair = {name: null, price: null, description: null};

  constructor(private repairservice: RepairService) { }

  ngOnInit() {
    // get the repairs
    this.repairservice.getRepairs()
      .then(repairs => this.repairs = repairs);
  }
  addrepair() {
    // just need to use the ngForm values from editable_repair
    this.repairservice.postRepair(this.editable_repair.name, this.editable_repair.price, this.editable_repair.description)
      .then(repair => {
        this.repairs.unshift(repair);
      });
  }
  updaterepair(repair: Repair) {
    console.log(repair);
    // PUT the updated repair in
    this.repairservice.putRepair(repair._id, repair.name, repair.price, repair.description)
      .then(new_repair => {
        const index = this.repairs.indexOf(repair);
        if (index > -1) {
          this.repairs.splice(index, 1, new_repair);
        }
      });
  }
  deleterepair(repair: Repair) {
    this.repairservice.deleteRepair(repair._id)
      .then( () => {
        const index = this.repairs.indexOf(repair);
        if (index > -1) {
          this.repairs.splice(index, 1);
        }
    }).catch(err => console.log(err));
  }
}
