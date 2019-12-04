import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddValidationComponent } from './add-validation.component';

describe('addValidationComponent', () => {
  let component: AddValidationComponent;
  let fixture: ComponentFixture<AddValidationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AddValidationComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddValidationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
