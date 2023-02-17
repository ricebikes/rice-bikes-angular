import { Component, OnInit } from "@angular/core";
import { Repair } from "../../models/repair";
import { RepairService } from "../../services/repair.service";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";

@Component({
  selector: "app-admin-repairs",
  templateUrl: "./admin-repairs.component.html",
  styleUrls: ["./admin-repairs.component.css"],
})
export class AdminRepairsComponent implements OnInit {
  repairs: Repair[];
  repairForm: FormGroup;
  editMode = false;
  editingRepair: Repair;
  editIDX = 0;

  editable_repair = { name: null, price: null, description: null };

  constructor(private repairservice: RepairService, private fb: FormBuilder) {}

  ngOnInit() {
    // get the repairs
    this.repairservice
      .getRepairs()
      .then(
        (repairs) =>
          (this.repairs = repairs.sort((a, b) =>
            a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1
          ))
      );
  }

  addrepair() {
    if (this.editMode) {
      this.updateRepair();
      return;
    }
    // just need to use the ngForm values from editable_repair
    this.repairservice
      .postRepair(
        this.editable_repair.name,
        this.editable_repair.price,
        this.editable_repair.description
      )
      .then((repair) => {
        this.repairs.unshift(repair);
      });
    this.editable_repair = {
      name: null,
      price: null,
      description: null,
    };
  }

  disablerepair(repair: Repair) {
    console.log(repair);
    // PUT the updated repair in
    this.repairservice.disableRepair(repair).then((new_repair) => {
      const index = this.repairs.indexOf(repair);
      if (index > -1) {
        this.repairs.splice(index, 1);
      }
    });
  }

  deleterepair(repair: Repair) {
    this.repairservice
      .deleteRepair(repair._id)
      .then(() => {
        const index = this.repairs.indexOf(repair);
        if (index > -1) {
          this.repairs.splice(index, 1);
        }
      })
      .catch((err) => console.log(err));
  }

  updateRepair() {
    // console.log(this.repairs[this.editIDX]);
    console.log(this.editable_repair);
    this.repairservice
      .putRepair(
        this.repairs[this.editIDX]._id,
        this.editable_repair.name,
        this.editable_repair.price,
        this.editable_repair.description
      )
      .then((res) => {
        this.repairs[this.editIDX] = <Repair>res;
        this.repairs = this.repairs.sort((a, b) =>
          a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1
        );
        this.setEditMode(0, false);
      });
  }

  setEditMode(idx: number, enabled: boolean) {
    console.log("editing", idx, enabled);
    this.editMode = enabled;
    if (!enabled) {
      // Disable edit mode
      this.editIDX = 0;
      this.editingRepair = null;
      this.editable_repair = {
        name: null,
        price: null,
        description: null,
      };
      return;
    }
    this.editingRepair = this.repairs[idx];
    this.editIDX = idx;
    // Fill the form so we can edit values
    this.editable_repair = {
      name: this.editingRepair.name,
      price: this.editingRepair.price,
      description: this.editingRepair.description,
    };
    console.log(this.editable_repair);
  }
}
