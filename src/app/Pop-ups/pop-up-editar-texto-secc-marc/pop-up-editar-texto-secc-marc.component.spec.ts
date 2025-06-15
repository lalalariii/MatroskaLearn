import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopUpEditarTextoSeccMarcComponent } from './pop-up-editar-texto-secc-marc.component';

describe('PopUpEditarTextoSeccMarcComponent', () => {
  let component: PopUpEditarTextoSeccMarcComponent;
  let fixture: ComponentFixture<PopUpEditarTextoSeccMarcComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PopUpEditarTextoSeccMarcComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopUpEditarTextoSeccMarcComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
