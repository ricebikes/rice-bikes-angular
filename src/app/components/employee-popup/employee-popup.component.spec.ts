import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeePopupComponent } from './employee-popup.component';

describe('EmployeePopupComponent', () => {
  let component: EmployeePopupComponent;
  let fixture: ComponentFixture<EmployeePopupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EmployeePopupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmployeePopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
