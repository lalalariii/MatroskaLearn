import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListaSeccionesMarcasAbreviadaComponent } from './lista-secciones-marcas-abreviada.component';

describe('ListaSeccionesMarcasAbreviadaComponent', () => {
  let component: ListaSeccionesMarcasAbreviadaComponent;
  let fixture: ComponentFixture<ListaSeccionesMarcasAbreviadaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListaSeccionesMarcasAbreviadaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListaSeccionesMarcasAbreviadaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
