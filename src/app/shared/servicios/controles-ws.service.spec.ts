import { TestBed } from '@angular/core/testing';

import { ControlesWsService } from './controles-ws.service';

describe('ControlesWsService', () => {
  let service: ControlesWsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ControlesWsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
