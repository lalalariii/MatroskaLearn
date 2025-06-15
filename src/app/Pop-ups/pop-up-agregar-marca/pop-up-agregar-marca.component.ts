import { Component, ElementRef, ViewChild } from '@angular/core';
import { SeleccionSeccionMarcaService } from '../../shared/servicios/seleccion-seccion-marca.service';
import { GestionSeccionesMarcasService } from '../../shared/servicios/gestion-secciones-marcas.service';
import { Modal } from 'bootstrap';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-pop-up-agregar-marca',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pop-up-agregar-marca.component.html',
  styleUrl: './pop-up-agregar-marca.component.css'
})
export class PopUpAgregarMarcaComponent {

  @ViewChild('popupCrearMarc') popUpRef!: ElementRef;
  private popUp!: Modal;

  textoMarcaNueva: string = "";
  tituloMarcaNueva: string = "";

  constructor(private seleccionarServ: SeleccionSeccionMarcaService, private gestionSeccMarServ: GestionSeccionesMarcasService){}
  
  ngAfterViewInit() {
    this.popUp = new Modal(this.popUpRef.nativeElement);
  }

  abrir(){
    this.popUp.show();
  }

  /**
   * Crea una marca en la posicion en la que se encuentra el cursor
   */
  crearMarcaLectura(){
    //Creamos la marca y la ponemos como marca seleccionada
    let marca = this.gestionSeccMarServ.crearMarcaEnCursor(this.tituloMarcaNueva, this.textoMarcaNueva);
    this.seleccionarServ.seleccionarMarca(marca);

    this.popUp.hide();
  }
  
}
