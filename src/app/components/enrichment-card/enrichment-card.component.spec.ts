import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EnrichmentCardComponent } from './enrichment-card.component';

describe('EnrichmentCardComponent', () => {
  let component: EnrichmentCardComponent;
  let fixture: ComponentFixture<EnrichmentCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EnrichmentCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EnrichmentCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
