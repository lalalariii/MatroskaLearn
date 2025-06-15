import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListaSeccionesMarcasComponent } from './lista-secciones-marcas.component';

describe('ListaSeccionesMarcasComponent', () => {
  let component: ListaSeccionesMarcasComponent;
  let fixture: ComponentFixture<ListaSeccionesMarcasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListaSeccionesMarcasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListaSeccionesMarcasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
