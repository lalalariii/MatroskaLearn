import { Component, ElementRef, ViewChild } from '@angular/core';
import { GestionSeccionesMarcasService } from '../../shared/servicios/gestion-secciones-marcas.service';
import { SeleccionSeccionMarcaService } from '../../shared/servicios/seleccion-seccion-marca.service';
import { Modal } from 'bootstrap';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-pop-up-agregar-secc-marc',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pop-up-agregar-secc-marc.component.html',
  styleUrl: './pop-up-agregar-secc-marc.component.css'
})
export class PopUpAgregarSeccMarcComponent {

  @ViewChild('popupCrearSeccMarc') popUpRef!: ElementRef;
  private popUp!: Modal;

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
  crearMarca(){
    //Creamos la marca y la ponemos como marca seleccionada
    let marca = this.gestionSeccMarServ.crearMarcaVaciaEnCursor();
    this.seleccionarServ.seleccionarMarca(marca);
  }

  crearSeccion(){
    let seccDerecha = this.gestionSeccMarServ.dividirSeccion();

    //Ponemos la seccion de la derecha como la nueva seccion seleccionada
    this.seleccionarServ.seleccionarSeccion(seccDerecha);
  }
}
