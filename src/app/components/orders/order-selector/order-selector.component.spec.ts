import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderSelectorComponent } from './order-selector.component';

describe('OrderSelectorComponent', () => {
  let component: OrderSelectorComponent;
  let fixture: ComponentFixture<OrderSelectorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrderSelectorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
