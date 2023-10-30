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
  AbstractControl,
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
  @Input("mode") mode: number;
  @Input("close") close: boolean;
  @Input("item") item: Item;
  @Input("viewOnly") viewOnly: boolean = false;

  // Emit this to the listening component
  @Output() newItem = new EventEmitter<Item>();
  @Output() closeAll = new EventEmitter<String>();
  @Output() editItem = new EventEmitter<Item>();

  @ViewChild("itemDetailsForm") itemDetailsForm: ElementRef;
  @ViewChild("inStock") inStock: ElementRef;
  @ViewChild("UPC") UPCinput: ElementRef;

  newItemForm = this.formBuilder.group({
    name: ["", Validators.required],
    brand: ["", Validators.required],
    standard_price: ["", Validators.required],
    upc: ["", [Validators.required, Validators.pattern("[0-9]+")]],
    category_1: ["Any", Validators.required],
    category_2: "",
    category_3: "",
    wholesale_cost: ["", Validators.required],
    in_stock: "",
    min_stock: ["", Validators.required],
    specifications: this.formBuilder.array([]),
    features: this.formBuilder.array([]),
  });

  categories = this.searchService.itemCategories1();
  categories2 = null;
  categories3 = null;
  viewspecs = [];
  viewfeatures = [];

  brands = this.searchService.itemBrands();

  is_core_stock = false;
  barcodeVal = null;
  elementType = "svg";
  format = "UPC";
  width = 2;
  height = 80;
  displayValue = true;
  font = "monospace";
  textMargin = 2;
  fontSize = 20;
  margin = 5;


  toggleCoreStock() {
    this.is_core_stock = !this.is_core_stock;
    if (!this.is_core_stock) {
      this.newItemForm.controls["min_stock"].setValue(null);
    }
  }
  print(): void {
    let printContents, popupWin;
    printContents = document.getElementById("print-section").innerHTML;
    var mywindow = window.open("", "PRINT");

    mywindow.document.write("<html><body style='margin: 0'>");
    mywindow.document.write(printContents);
    mywindow.document.write(
      "</body></html>"
    );

    mywindow.document.close(); // necessary for IE >= 10
    mywindow.focus(); // necessary for IE >= 10*/

    mywindow.print();
  }

  constructor(
    private searchService: SearchService,
    private formBuilder: FormBuilder,
    private itemService: ItemService,
    private authenticationService: AuthenticationService
  ) { }

  ngOnChanges(changes: { [property: string]: SimpleChange }) {
    if (this.mode != 0) this.fillValuesIfEdit();
    // Extract changes to the input property by its name
    let change: SimpleChange = changes["close"];

    this.newItemForm.reset();
    this.newItemForm.controls.specifications = this.formBuilder.array([]);
    this.newItemForm.controls.features = this.formBuilder.array([]);
    this.categories2 = null;
    this.categories3 = null;
    this.itemDetailsForm.nativeElement.classList.remove("was-validated");

    // if was editing, turn back to view
    if (this.mode == 2) {
      this.mode = 1;
    }
  }

  get specifications() {
    return this.newItemForm.controls["specifications"] as FormArray;
  }

  get features() {
    return this.newItemForm.controls["features"] as FormArray;
  }

  createFormGroup(key: string, value: string) {
    return this.formBuilder.group({
      key: [key, Validators.required],
      value: [value, Validators.required],
    });
  }

  async fillValuesIfEdit() {
    if (this.item) {
      let json = JSON.stringify(this.item.specifications);
      let specs;
      if (json) specs = new Map(Object.entries(JSON.parse(json)));
      else specs = new Map();
      this.viewspecs = Array.from(specs);
      this.viewfeatures = this.item.features;

      this.newItemForm.controls["features"] = this.formBuilder.array([]);
      for (const feature of this.viewfeatures) {
        this.addFeature(feature);
      }
      this.newItemForm.controls["specifications"] = this.formBuilder.array([]);
      for (const spec of this.viewspecs) {
        this.addSpec(spec[0], spec[1]);
      }
      this.categories2 = await this.searchService.itemCategories2(
        this.item.category_1
      );
      if (this.categories2) {
        this.categories3 = await this.searchService.itemCategories3(
          this.item.category_1,
          this.item.category_2
        );
      }
    }
    this.is_core_stock = this.item && this.item.min_stock > 0;
    this.newItemForm.patchValue({
      upc: this.upc ? this.upc : this.item && this.item.upc,
      name: this.item && this.item.name,
      brand: this.item && this.item.brand,
      standard_price: this.item && this.item.standard_price,
      wholesale_cost: this.item && this.item.wholesale_cost,
      in_stock: this.item && this.item.in_stock,
      min_stock: this.item && this.item.min_stock,
      category_1: this.item && this.item.category_1,
      category_2: this.item && this.item.category_2,
      category_3: this.item && this.item.category_3,
    });
  }

  async ngOnInit() {
    this.fillValuesIfEdit();
    this.newItemForm.patchValue({
      upc: this.upc ? this.upc : this.item && this.item.upc,
    });
  }

  async generateUPC() {
    let newUPC = await this.itemService.nextUPC();
    this.newItemForm.patchValue({
      upc: newUPC,
    });
  }

  async onCat1Change(e) {
    this.categories2 = await this.searchService.itemCategories2(e.target.value);
    this.categories3 = null;
    this.newItemForm.controls["category_2"].setValue(null);
    this.newItemForm.controls["category_3"].setValue(null);
  }

  async onCat2Change(e) {
    if (e.target.value == "") return;
    this.categories3 = await this.searchService.itemCategories3(
      this.newItemForm.controls["category_1"].value,
      e.target.value
    );
    this.newItemForm.controls["category_3"].setValue(null);
  }

  addSpec(key?: string, value?: string) {
    this.specifications.push(this.createFormGroup(key, value));
  }

  removeSpec(index: number) {
    this.specifications.removeAt(index);
  }

  addFeature(value?: string) {
    this.features.push(
      this.formBuilder.group({ value: [value, Validators.required] })
    );
  }

  removeFeature(index: number) {
    this.features.removeAt(index);
  }

  validate(update?: boolean) {
    var form = document.getElementsByClassName(
      "needs-validation"
    )[0] as HTMLFormElement;
    if (form.checkValidity() === false) {
      event.preventDefault();
      event.stopPropagation();
      form.classList.add("was-validated");
    } else if (update) {
      this.updateItem();
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
        brand: this.newItemForm.controls["brand"].value.toUpperCase(),
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
        min_stock: this.newItemForm.controls["min_stock"].value
      })
      .then((res) => {
        this.resetForms();
        this.newItem.emit(res);
      });
  }

  updateItem() {
    this.itemService
      .updateItem(this.item._id, {
        _id: "",
        name: this.newItemForm.controls["name"].value,
        upc: this.newItemForm.controls["upc"].value,
        category_1: this.newItemForm.controls["category_1"].value,
        category_2: this.newItemForm.controls["category_2"].value,
        category_3: this.newItemForm.controls["category_3"].value,
        brand: this.newItemForm.controls["brand"].value.toUpperCase(),
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
        min_stock: this.newItemForm.controls["min_stock"].value
      })
      .then((res) => {
        this.item = res;
        this.setMode(1);
        this.editItem.emit(res);
      });
  }

  setMode(mode: number) {
    this.mode = mode;
    this.fillValuesIfEdit();
  }

  resetForms() {
    this.itemDetailsForm.nativeElement.classList.remove("was-validated");
    this.newItemForm.reset();
    this.categories2 = null;
    this.categories3 = null;
    this.newItemForm.controls.specifications = this.formBuilder.array([]);
    this.newItemForm.controls.features = this.formBuilder.array([]);
    this.closeAll.emit("close!");
    if (this.mode == 2) {
      this.mode = 1;
    }
  }
}
