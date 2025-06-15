import { Component, ElementRef, EventEmitter, Output, ViewChild } from '@angular/core';
import { Modal } from 'bootstrap';

@Component({
  selector: 'app-pop-up-introducir-mkv',
  standalone: true,
  imports: [],
  templateUrl: './pop-up-introducir-mkv.component.html',
  styleUrl: './pop-up-introducir-mkv.component.css'
})
export class PopUpIntroducirMkvComponent {

  @Output() ficheroIntroducido = new EventEmitter<File>();

  @ViewChild('popupIntroducirArchivoMkv') popUpRef!: ElementRef;

  private popUp!: Modal;
  archivoMkv!: File;

  constructor(){}
  
  ngAfterViewInit() {
    this.popUp = new Modal(this.popUpRef.nativeElement);
  }

  abrir(){
    this.popUp.show();
  }

  /**
 * Obtiene y guarda el archivo MKV del evento del input
 * @param event evento de input que contiene el archivo mkv
 */
  introducirMkv(event: any){
  this.archivoMkv = event.target.files[0];
}

  aceptar(){
    this.ficheroIntroducido.emit(this.archivoMkv);
  }
  
}
