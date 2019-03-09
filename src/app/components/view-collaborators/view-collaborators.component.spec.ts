import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewCollaboratorsComponent } from './view-collaborators.component';

describe('ViewCollaboratorsComponent', () => {
  let component: ViewCollaboratorsComponent;
  let fixture: ComponentFixture<ViewCollaboratorsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewCollaboratorsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewCollaboratorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
