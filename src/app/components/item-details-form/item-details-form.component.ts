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
  SimpleChange,
  TemplateRef,
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
  selector: "app-item-details-form",
  templateUrl: "item-details-form.component.html",
  styleUrls: ["item-details-form.component.css", "../../app.component.css"],
})
export class ItemDetailsFormComponent implements OnInit {
  // Input: if user is an employee or not
  @Input("employee") employee: boolean;
  @Input("upc") upc: string;
  @Input() modalClose: () => void;
  @Input("mode") mode: string;
  @Input("close") close: boolean;
  @Input("item") item: Item;

  // Emit this to the listening component
  @Output() newItem = new EventEmitter<Item>();
  @Output() closeAll = new EventEmitter<String>();

  @ViewChild("itemDetailsForm") itemDetailsForm: ElementRef;

  title = "Item Details";

  newItemForm = this.formBuilder.group({
    name: ["", Validators.required],
    brand: ["", Validators.required],
    standard_price: ["", Validators.required],
    upc: ["", [Validators.required, Validators.pattern("[0-9]+")]],
    category_1: ["Any", Validators.required],
    category_2: "",
    category_3: "",
    wholesale_cost: ["", Validators.required],
    specifications: this.formBuilder.array([]),
    features: this.formBuilder.array([]),
    in_stock: ["", Validators.required],
  });

  categories = this.searchService.itemCategories1();
  categories2 = this.searchService.itemCategories2();
  categories3 = null;
  viewspecs = [];

  brands = this.searchService.itemBrands();

  constructor(
    private searchService: SearchService,
    private formBuilder: FormBuilder,
    private itemService: ItemService,
    private authenticationService: AuthenticationService
  ) {}

  ngOnChanges(changes: { [property: string]: SimpleChange }) {
    // Extract changes to the input property by its name
    let change: SimpleChange = changes["close"];

    this.newItemForm.reset();
    this.newItemForm.controls.specifications = this.formBuilder.array([]);
    this.newItemForm.controls.features = this.formBuilder.array([]);
    this.itemDetailsForm.nativeElement.classList.remove("was-validated");
  }

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
    console.log("mode", this.mode);
    console.log("item", this.item);
    let json = JSON.stringify(this.item.specifications);
    let specs = new Map(Object.entries(JSON.parse(json)));
    this.viewspecs = Array.from(specs);
    this.upc = this.item.upc;
    this.newItemForm.patchValue({
      upc: this.upc,
    });
    if (this.mode == "create") {
      this.title = "Create New Item";
    }
    console.log(this.newItemForm);
  }

  async generateUPC() {
    console.log("?");
    let newUPC = await this.itemService.nextUPC();
    this.newItemForm.patchValue({
      upc: newUPC,
    });
  }

  onCat1Change(e) {
    this.categories2 = this.searchService.itemCategories2(e.target.value);
  }

  onCat2Change(e) {
    this.categories3 = this.searchService.itemCategories3(
      this.newItemForm.controls["category_1"].value,
      e.target.value
    );
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

  validate() {
    var form = document.getElementsByClassName(
      "needs-validation"
    )[0] as HTMLFormElement;
    if (form.checkValidity() === false) {
      event.preventDefault();
      event.stopPropagation();
      form.classList.add("was-validated");
    } else {
      this.submitItemCreateForm();
    }
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
        in_stock: this.newItemForm.controls["in_stock"].value,
      })
      .then((res) => {
        this.resetForms();
        this.newItem.emit(res);
        console.log("item created", res);

        // add new item to transaction
      });
  }

  resetForms() {
    this.itemDetailsForm.nativeElement.classList.remove("was-validated");
    this.newItemForm.reset();
    this.newItemForm.controls.specifications = this.formBuilder.array([]);
    this.newItemForm.controls.features = this.formBuilder.array([]);
    this.closeAll.emit("close!");
  }
}
