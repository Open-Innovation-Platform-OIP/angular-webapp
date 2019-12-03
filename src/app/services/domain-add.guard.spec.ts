import { TestBed, async, inject } from '@angular/core/testing';

import { DomainAddGuard } from './domain-add.guard';

describe('DomainAddGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DomainAddGuard]
    });
  });

  it('should ...', inject([DomainAddGuard], (guard: DomainAddGuard) => {
    expect(guard).toBeTruthy();
  }));
});
