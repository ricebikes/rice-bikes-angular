import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderRequestSelectorComponent } from './order-request-selector.component';

describe('OrderRequestSelectorComponent', () => {
  let component: OrderRequestSelectorComponent;
  let fixture: ComponentFixture<OrderRequestSelectorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OrderRequestSelectorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderRequestSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
