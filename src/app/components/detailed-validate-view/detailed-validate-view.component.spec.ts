import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailedValidateViewComponent } from './detailed-validate-view.component';

describe('DetailedValidateViewComponent', () => {
  let component: DetailedValidateViewComponent;
  let fixture: ComponentFixture<DetailedValidateViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DetailedValidateViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DetailedValidateViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
