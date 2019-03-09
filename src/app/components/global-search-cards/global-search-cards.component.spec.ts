import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GlobalSearchCardsComponent } from './global-search-cards.component';

describe('GlobalSearchCardsComponent', () => {
  let component: GlobalSearchCardsComponent;
  let fixture: ComponentFixture<GlobalSearchCardsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GlobalSearchCardsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GlobalSearchCardsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
