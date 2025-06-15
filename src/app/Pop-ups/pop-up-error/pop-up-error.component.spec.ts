import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopUpErrorComponent } from './pop-up-error.component';

describe('PopUpErrorComponent', () => {
  let component: PopUpErrorComponent;
  let fixture: ComponentFixture<PopUpErrorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PopUpErrorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopUpErrorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
