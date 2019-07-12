import { TestBed } from '@angular/core/testing';

import { SpacedRepetitionService } from './spaced-repetition.service';

describe('SpacedRepetitionService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SpacedRepetitionService = TestBed.get(SpacedRepetitionService);
    expect(service).toBeTruthy();
  });
});
