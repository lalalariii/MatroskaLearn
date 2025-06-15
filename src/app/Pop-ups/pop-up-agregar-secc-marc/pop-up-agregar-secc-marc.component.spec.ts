import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopUpAgregarSeccMarcComponent } from './pop-up-agregar-secc-marc.component';

describe('PopUpAgregarSeccMarcComponent', () => {
  let component: PopUpAgregarSeccMarcComponent;
  let fixture: ComponentFixture<PopUpAgregarSeccMarcComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PopUpAgregarSeccMarcComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopUpAgregarSeccMarcComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
