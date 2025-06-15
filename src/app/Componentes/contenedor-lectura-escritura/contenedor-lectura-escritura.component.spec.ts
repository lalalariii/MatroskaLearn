import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContenedorLecturaEscrituraComponent } from './contenedor-lectura-escritura.component';

describe('ContenedorLecturaEscrituraComponent', () => {
  let component: ContenedorLecturaEscrituraComponent;
  let fixture: ComponentFixture<ContenedorLecturaEscrituraComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContenedorLecturaEscrituraComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContenedorLecturaEscrituraComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
