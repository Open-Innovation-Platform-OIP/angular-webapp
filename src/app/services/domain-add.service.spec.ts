import { TestBed } from '@angular/core/testing';

import { DomainAddService } from './domain-add.service';

describe('DomainAddService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DomainAddService = TestBed.get(DomainAddService);
    expect(service).toBeTruthy();
  });
});
