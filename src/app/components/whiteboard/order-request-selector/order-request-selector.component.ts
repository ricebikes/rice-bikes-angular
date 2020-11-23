import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { OrderRequest } from '../../../models/orderRequest';
import { OrderRequestService } from '../../../services/order-request.service';

@Component({
  selector: 'app-order-request-selector',
  templateUrl: './order-request-selector.component.html',
  styleUrls: ['./order-request-selector.component.css']
})
export class OrderRequestSelectorComponent implements OnInit {

  @ViewChild('orderRequestModalButton') orderRequestModalButton: ElementRef;

  activeOrderRequests: Promise<OrderRequest[]>;

  // Set to true when the user clicks button to create a new whiteboard entry
  createMode = false;

  constructor(private orderRequestService: OrderRequestService) { }

  ngOnInit() {
    this.activeOrderRequests = this.orderRequestService.getActiveRequests();
  }

  public launchOrderRequestSelector() {
    this.orderRequestModalButton.nativeElement.click();
  }
}
