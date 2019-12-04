import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SolutionDetailComponent } from './solution-detail.component';

describe('SolutionDetailComponent', () => {
  let component: SolutionDetailComponent;
  let fixture: ComponentFixture<SolutionDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SolutionDetailComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SolutionDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
