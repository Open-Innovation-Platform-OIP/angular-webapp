import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEnrichmentComponent } from './add-enrichment.component';

describe('AddEnrichmentComponent', () => {
  let component: AddEnrichmentComponent;
  let fixture: ComponentFixture<AddEnrichmentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddEnrichmentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddEnrichmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
