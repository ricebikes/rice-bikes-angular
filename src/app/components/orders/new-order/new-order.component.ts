import { Component, OnInit } from '@angular/core';
import {OrderService} from '../../../services/order.service';
import {Router} from '@angular/router';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';

@Component({
  selector: 'app-new-order',
  templateUrl: './new-order.component.html',
  styleUrls: ['./new-order.component.css']
})
export class NewOrderComponent implements OnInit {

  constructor(private orderService: OrderService,
              private router: Router,
              private formBuilder: FormBuilder) { }

  orderForm: FormGroup;

  ngOnInit() {
    this.orderForm = this.formBuilder.group({
      supplier: ['', Validators.required]
    });
  }

  submit() {
     this.createOrder(this.orderForm.controls['supplier'].value);
  }

  /**
   * Creates order and navigates to order page
   * @param supplier: String describing order supplier
   */
  createOrder(supplier: string) {
    this.orderService.createOrder(supplier)
      .then(order => this.router.navigate(['/orders']));
  }
}
