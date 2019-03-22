import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DisplayModalComponent } from './display-modal.component';

describe('DisplayModalComponent', () => {
  let component: DisplayModalComponent;
  let fixture: ComponentFixture<DisplayModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DisplayModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DisplayModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
