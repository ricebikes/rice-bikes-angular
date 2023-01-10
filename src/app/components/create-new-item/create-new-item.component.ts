import {
    Component,
    OnInit,
    ViewChild,
    ElementRef,
    Output,
    EventEmitter,
    Input,
    Pipe,
    PipeTransform,
  } from "@angular/core";
  import {
    FormBuilder,
    FormArray,
    FormControl,
    FormGroup,
    ValidatorFn,
    ValidationErrors,
    Validators,
  } from "@angular/forms";
  import { SearchService } from "../../services/search.service";
  import { Item } from "../../models/item";
  import { Observable } from "rxjs/Observable";
  import { ItemService } from "../../services/item.service";
  import { AuthenticationService } from "../../services/authentication.service";
  
  @Component({
    selector: "app-create-new-item",
    templateUrl: "create-new-item.component.html",
    styleUrls: ["create-new-item.component.css", "../../app.component.css"],
  })
  export class CreateNewItemComponent implements OnInit {
    // Input: if user is an employee or not
    @Input("employee") employee: boolean;
    @Input("upc") upc: string;

    // Emit this to the listening component
    @Output() chosenItem = new EventEmitter<Item>();
  
    itemForm = this.formBuilder.group({
      name: null,
      brand: null,
      category_1: null,
      category_2: null,
      category_3: null,
    });
  
    newItemForm = this.formBuilder.group({
      name: ["", Validators.required],
      brand: ["", Validators.required],
      standard_price: ["", [Validators.required, Validators.pattern("^[0-9]*$")]],
      upc: ["", [Validators.required, Validators.pattern("[0-9]+")]],
      category_1: ["", Validators.required],
      category_2: "",
      category_3: "",
      wholesale_cost: ["", [Validators.required, Validators.pattern("^[0-9]*$")]],
      specifications: this.formBuilder.array([]),
      features: this.formBuilder.array([]),
      in_stock: ["", [Validators.required, Validators.pattern("^[0-9]*$")]]
    });
  
    scanData = new FormControl(
      "",
      Validators.compose([Validators.required, Validators.pattern("[0-9]+")])
    );
  
    // categories = this.searchService.itemCategories1();
    // categories2 = this.searchService.itemCategories2();
    brands = this.searchService.itemBrands();
  
    constructor(
      private searchService: SearchService,
      private formBuilder: FormBuilder,
      private itemService: ItemService,
      private authenticationService: AuthenticationService
    ) {}
  
    get specifications() {
      return this.newItemForm.controls["specifications"] as FormArray;
    }
  
    get features() {
      return this.newItemForm.controls["features"] as FormArray;
    }
  
    createEmpFormGroup() {
      return this.formBuilder.group({
        key: ["", Validators.required],
        value: ["", Validators.required],
      });
    }

    ngOnInit() {
      console.log("upc", this.upc);
      this.newItemForm.patchValue({
        upc: this.upc
      });
    }

    addSpec() {
      this.specifications.push(this.createEmpFormGroup());
    }
  
    removeSpec(index: number) {
      this.specifications.removeAt(index);
    }
  
    addFeature() {
      this.features.push(
        this.formBuilder.group({ value: ["", Validators.required] })
      );
    }
  
    removeFeature(index: number) {
      this.features.removeAt(index);
    }
    /**
     * Submits the item creation form, and creates the item
     */
    submitItemCreateForm() {
      this.itemService
        .createItem({
          _id: "",
          name: this.newItemForm.controls["name"].value,
          upc: this.newItemForm.controls["upc"].value,
          category_1: this.newItemForm.controls["category_1"].value,
          category_2: this.newItemForm.controls["category_2"].value,
          category_3: this.newItemForm.controls["category_3"].value,
          brand: this.newItemForm.controls["brand"].value,
          standard_price: this.newItemForm.controls["standard_price"].value,
          wholesale_cost: this.newItemForm.controls["wholesale_cost"].value,
          specifications: this.newItemForm.controls[
            "specifications"
          ].value.reduce(function (map, obj) {
            map[obj.key] = obj.value;
            return map;
          }, {}),
          features: this.newItemForm.controls["features"].value.map(
            (obj) => obj.value
          ),
          in_stock: this.newItemForm.controls["in_stock"].value
        })
        .then((res) => {
          this.newItemForm.reset();
          this.chosenItem.emit(res);
        });
    }
  }
  