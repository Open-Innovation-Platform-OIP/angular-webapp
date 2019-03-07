import { TestBed } from '@angular/core/testing';

import { OrgsService } from './orgs.service';

describe('OrgsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: OrgsService = TestBed.get(OrgsService);
    expect(service).toBeTruthy();
  });
});
