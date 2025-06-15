import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PanelEdicionVisionSeccMarcaComponent } from './panel-edicion-vision-secc-marca.component';

describe('PanelEdicionVisionSeccMarcaComponent', () => {
  let component: PanelEdicionVisionSeccMarcaComponent;
  let fixture: ComponentFixture<PanelEdicionVisionSeccMarcaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PanelEdicionVisionSeccMarcaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PanelEdicionVisionSeccMarcaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
