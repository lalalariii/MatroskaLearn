import { TestBed } from '@angular/core/testing';

import { IndentificarDispositivoService } from './indentificar-dispositivo.service';

describe('IndentificarDispositivoService', () => {
  let service: IndentificarDispositivoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IndentificarDispositivoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
