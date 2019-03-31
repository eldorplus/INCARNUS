import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AvailabletimeComponent } from './availabletime.component';

describe('AvailabletimeComponent', () => {
  let component: AvailabletimeComponent;
  let fixture: ComponentFixture<AvailabletimeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AvailabletimeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AvailabletimeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
