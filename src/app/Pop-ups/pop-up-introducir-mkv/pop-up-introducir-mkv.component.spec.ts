import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopUpIntroducirMkvComponent } from './pop-up-introducir-mkv.component';

describe('PopUpIntroducirMkvComponent', () => {
  let component: PopUpIntroducirMkvComponent;
  let fixture: ComponentFixture<PopUpIntroducirMkvComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PopUpIntroducirMkvComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopUpIntroducirMkvComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
