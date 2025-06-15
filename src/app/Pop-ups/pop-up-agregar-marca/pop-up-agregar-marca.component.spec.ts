import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopUpAgregarMarcaComponent } from './pop-up-agregar-marca.component';

describe('PopUpAgregarMarcaComponent', () => {
  let component: PopUpAgregarMarcaComponent;
  let fixture: ComponentFixture<PopUpAgregarMarcaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PopUpAgregarMarcaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopUpAgregarMarcaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
