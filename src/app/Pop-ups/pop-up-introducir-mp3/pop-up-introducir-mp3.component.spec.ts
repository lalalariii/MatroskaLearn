import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopUpIntroducirMp3Component } from './pop-up-introducir-mp3.component';

describe('PopUpIntroducirMp3Component', () => {
  let component: PopUpIntroducirMp3Component;
  let fixture: ComponentFixture<PopUpIntroducirMp3Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PopUpIntroducirMp3Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopUpIntroducirMp3Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
