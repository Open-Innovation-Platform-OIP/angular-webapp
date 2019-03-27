import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EnrichmentFormComponent } from './enrichment-form.component';

describe('EnrichmentFormComponent', () => {
  let component: EnrichmentFormComponent;
  let fixture: ComponentFixture<EnrichmentFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EnrichmentFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EnrichmentFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
