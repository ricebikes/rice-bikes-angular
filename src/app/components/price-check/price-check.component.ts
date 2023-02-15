import { Component, ViewChild, ElementRef, Renderer2 } from "@angular/core";
import { FormControl, Validators } from "@angular/forms";
import { SearchService } from "../../services/search.service";
import { Item } from "../../models/item";

@Component({
  selector: "app-price-check",
  templateUrl: "price-check.component.html",
  styleUrls: ["price-check.component.css"],
})
export class PriceCheckComponent {
  @ViewChild("scanTrigger") scanTrigger: ElementRef;
  @ViewChild("scanInput") scanInput: ElementRef;
  @ViewChild("priceCheckTrigger") priceCheckTrigger: ElementRef;
  @ViewChild("priceCheckScanModal") scanModal: ElementRef;

  priceCheckItem: Item;
  scanData = new FormControl(
    "",
    Validators.compose([Validators.required, Validators.pattern("[0-9]+")])
  );
  searchingForUPC = false;
  viewItemFromUPC = false;
  constructor(
    private searchService: SearchService,
    private renderer: Renderer2
  ) {
    this.renderer.listen("window", "click", (e: Event) => {
      if (e.target == this.scanModal.nativeElement) {
        this.scanData.reset();
        this.closeAndResetAll("clicked out of modal");
      }
    });
  }

  triggerScanModal() {
    // trigger the scan modal
    this.scanTrigger.nativeElement.click();
    // keeping timeout in case it needs to be raise but it appears to not be required if the modal does not fade
    // timeout works as 0 ms, but keeping a small buffer just in case
    setTimeout(() => this.scanInput.nativeElement.focus(), 50);
  }

  /**
   * Triggered when the scan dialog gets a UPC, followed by the enter key
   */
  addByUPC() {
    this.searchingForUPC = true;
    if (this.scanData.invalid || this.scanData.value == "") {
      return;
    }
    this.searchService.upcSearch(this.scanData.value).then((item) => {
      this.searchingForUPC = false;
      if (item) {
        this.viewItemFromUPC = true;
        // this.v(item);
        this.scanData.reset();
      } else {
        this.scanData.setErrors({ badUPC: "true" });
        return;
      }
    });
  }

  closeAndResetAll(message: string) {
    this.viewItemFromUPC = false;
    this.scanData.reset();
  }
}
