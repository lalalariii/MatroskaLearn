import { Component, ElementRef, EventEmitter, Output, ViewChild } from '@angular/core';
import { Modal } from 'bootstrap';

@Component({
  selector: 'app-pop-up-introducir-mp3',
  standalone: true,
  imports: [],
  templateUrl: './pop-up-introducir-mp3.component.html',
  styleUrl: './pop-up-introducir-mp3.component.css'
})
export class PopUpIntroducirMp3Component {

  @Output() ficheroIntroducido = new EventEmitter<File>();

  @ViewChild('popupIntroducirArchivoMp3') popUpRef!: ElementRef;
  private popUp!: Modal;
  archivoMp3!: File;

  constructor(){}
  
  ngAfterViewInit() {
    this.popUp = new Modal(this.popUpRef.nativeElement);
  }

  abrir(){
    this.popUp.show();
  }

  /**
   * Obtiene y guarda el archivo mp3 del evento del input
   * @param event evento de input que contiene el archivo mp3
   */
  introducirMp3(event: any){
    this.archivoMp3 = event.target.files[0];
  }

  aceptar(){
    this.ficheroIntroducido.emit(this.archivoMp3);
  }
}
