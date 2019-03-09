import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProblemsViewComponent } from './problems-view.component';

describe('ProblemsViewComponent', () => {
  let component: ProblemsViewComponent;
  let fixture: ComponentFixture<ProblemsViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProblemsViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProblemsViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
