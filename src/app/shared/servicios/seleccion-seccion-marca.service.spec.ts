import { TestBed } from '@angular/core/testing';

import { SeleccionSeccionMarcaService } from './seleccion-seccion-marca.service';

describe('SeleccionSeccionMarcaService', () => {
  let service: SeleccionSeccionMarcaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SeleccionSeccionMarcaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
