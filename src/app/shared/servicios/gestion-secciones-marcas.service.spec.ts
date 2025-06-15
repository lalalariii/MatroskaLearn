import { TestBed } from '@angular/core/testing';

import { GestionSeccionesMarcasService } from './gestion-secciones-marcas.service';

describe('GestionSeccionesMarcasService', () => {
  let service: GestionSeccionesMarcasService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GestionSeccionesMarcasService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
