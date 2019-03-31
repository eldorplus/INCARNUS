import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctorappoimentComponent } from './doctorappoiment.component';

describe('DoctorappoimentComponent', () => {
  let component: DoctorappoimentComponent;
  let fixture: ComponentFixture<DoctorappoimentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DoctorappoimentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DoctorappoimentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
