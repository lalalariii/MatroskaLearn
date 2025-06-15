import { Component, ElementRef, ViewChild } from '@angular/core';
import { Modal } from 'bootstrap';

@Component({
  selector: 'app-pop-up-error',
  standalone: true,
  imports: [],
  templateUrl: './pop-up-error.component.html',
  styleUrl: './pop-up-error.component.css'
})
export class PopUpErrorComponent {

  @ViewChild('popUpMensajeError') popUpRef!: ElementRef;
  private popUp!: Modal;

  mensajeError!: string;

  ngAfterViewInit() {
    this.popUp = new Modal(this.popUpRef.nativeElement);
  }

  mostrarError(mensajeError: string){
    this.mensajeError = mensajeError;
    this.popUp.show();
  }
}
