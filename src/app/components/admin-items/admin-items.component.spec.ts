import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminItemsComponent } from './admin-items.component';

describe('AdminItemsComponent', () => {
  let component: AdminItemsComponent;
  let fixture: ComponentFixture<AdminItemsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminItemsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminItemsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
