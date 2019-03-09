import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewEnrichmentComponent } from './view-enrichment.component';

describe('ViewEnrichmentComponent', () => {
  let component: ViewEnrichmentComponent;
  let fixture: ComponentFixture<ViewEnrichmentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewEnrichmentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewEnrichmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
