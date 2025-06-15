import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReproductorWsComponent } from './reproductor-ws.component';

describe('ReproductorWsComponent', () => {
  let component: ReproductorWsComponent;
  let fixture: ComponentFixture<ReproductorWsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReproductorWsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReproductorWsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
