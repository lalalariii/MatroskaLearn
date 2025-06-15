import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopUpCargaComponent } from './pop-up-carga.component';

describe('PopUpCargaComponent', () => {
  let component: PopUpCargaComponent;
  let fixture: ComponentFixture<PopUpCargaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PopUpCargaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopUpCargaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
