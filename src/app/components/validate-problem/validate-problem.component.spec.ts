import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ValidateProblemComponent } from './validate-problem.component';

describe('ValidateProblemComponent', () => {
  let component: ValidateProblemComponent;
  let fixture: ComponentFixture<ValidateProblemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ValidateProblemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ValidateProblemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
