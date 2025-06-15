import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Modal } from 'bootstrap';

@Component({
  selector: 'app-pop-up-carga',
  standalone: true,
  imports: [ CommonModule, FormsModule],
  templateUrl: './pop-up-carga.component.html',
  styleUrl: './pop-up-carga.component.css'
})
export class PopUpCargaComponent {

  @ViewChild('popUpCargando') popUpRef!: ElementRef;
  popUp!: Modal;

  ngAfterViewInit() {
    this.popUp = new Modal(this.popUpRef.nativeElement);
  }

  abrir(){
    this.popUp.show();
  }

  cerrar(){
    setTimeout(() => this.popUp.hide(), 100);
  }
}
