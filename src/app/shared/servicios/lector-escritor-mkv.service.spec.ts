import { TestBed } from '@angular/core/testing';

import { LectorEscritorMkvService } from './lector-escritor-mkv.service';

describe('LectorEscritorMkvService', () => {
  let service: LectorEscritorMkvService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LectorEscritorMkvService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
