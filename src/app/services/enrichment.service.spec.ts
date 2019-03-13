import { TestBed } from '@angular/core/testing';

import { EnrichmentService } from './enrichment.service';

describe('EnrichmentService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: EnrichmentService = TestBed.get(EnrichmentService);
    expect(service).toBeTruthy();
  });
});
