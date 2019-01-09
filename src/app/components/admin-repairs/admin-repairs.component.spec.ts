import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminRepairsComponent } from './admin-repairs.component';

describe('AdminRepairsComponent', () => {
  let component: AdminRepairsComponent;
  let fixture: ComponentFixture<AdminRepairsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminRepairsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminRepairsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
