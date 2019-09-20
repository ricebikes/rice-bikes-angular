import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserTrackerComponent } from './user-tracker.component';

describe('UserTrackerComponent', () => {
  let component: UserTrackerComponent;
  let fixture: ComponentFixture<UserTrackerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserTrackerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserTrackerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
