import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ValidateCardComponent } from './validate-card.component';

describe('ValidateCardComponent', () => {
  let component: ValidateCardComponent;
  let fixture: ComponentFixture<ValidateCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ValidateCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ValidateCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
