import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GlobalSearchViewComponent } from './global-search-view.component';

describe('GlobalSearchViewComponent', () => {
  let component: GlobalSearchViewComponent;
  let fixture: ComponentFixture<GlobalSearchViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GlobalSearchViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GlobalSearchViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
