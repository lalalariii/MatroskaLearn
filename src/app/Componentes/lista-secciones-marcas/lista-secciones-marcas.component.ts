import { Component, Input} from '@angular/core';
import { MarcaAudio, ModoVisionArchivo, SeccionAudio } from '../../shared/interfaces/app.model';
import { SeleccionSeccionMarcaService } from '../../shared/servicios/seleccion-seccion-marca.service';
import { ControlesWsService } from '../../shared/servicios/controles-ws.service';
import { Region } from 'wavesurfer.js/dist/plugins/regions.js';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ConversorTiempo } from '../../shared/clases/ConversorTiempo';
import { GestionSeccionesMarcasService } from '../../shared/servicios/gestion-secciones-marcas.service';
import { IndentificarDispositivoService } from '../../shared/servicios/indentificar-dispositivo.service';

@Component({
  selector: 'app-lista-secciones-marcas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './lista-secciones-marcas.component.html',
  styleUrl: './lista-secciones-marcas.component.css',
  
})
export class ListaSeccionesMarcasComponent {

  @Input() modoInterfaz!: ModoVisionArchivo;

  editarTituloSeccionMarca = false;

  ConversorTiempo = ConversorTiempo;

  secciones!: SeccionAudio[];


  constructor(private seleccionService: SeleccionSeccionMarcaService,
    private ctrlWs: ControlesWsService, private gestionSeccMarcServ: GestionSeccionesMarcasService
  , private identDispServ: IndentificarDispositivoService
  ){}

  inicializar(){
    this.secciones = this.gestionSeccMarcServ.getArraySecciones();
  }
  
  /**
   * Selecciona la seccion a editar
   * @param seccionSelecc seccion a editar
   */
  async seleccionarSeccion(seccionSelecc: SeccionAudio){

    //Seleccionamos la seccion
    this.seleccionService.seleccionarSeccion(seccionSelecc);
    
    if(this.modoInterfaz === ModoVisionArchivo.ESCRITURA){// MODO ESCRITURA

      //Reseteamos la edicion de titulo
      this.editarTituloSeccionMarca = false;
    } 
  }

  /**
   * Selecciona la marca a editar
   * @param marcaSelecc marca a editar
   */
  seleccionarMarca(marcaSelecc: MarcaAudio){
    if(this.modoInterfaz === ModoVisionArchivo.ESCRITURA){ // MODO ESCRITURA
      
      //Seleccionamos la marca
      this.seleccionService.seleccionarMarca(marcaSelecc);

      //Reseteamos la edicion de titulo
      this.editarTituloSeccionMarca = false;
    }
    else{ // MODO LECTURA
      marcaSelecc.region.play();
    }
  }
  
  /**
   * Funcion ejecutada al hacer click en una seccion de la lista de secciones. Selecciona la seccion en modo escritura y
   * la reproduce desde el inicio en modo lectura
   * @param seccionSelecc Seccion en la que se hizo click
   */
  clickItemSeccion(seccionSelecc: SeccionAudio){

    if(this.modoInterfaz === ModoVisionArchivo.ESCRITURA){
      this.seleccionarSeccion(seccionSelecc);
    }
    else{
      seccionSelecc.region.play();
    }
  }

  clickSeccion(seccionSelecc: SeccionAudio){
    if(!this.identDispServ.isPortrait()){
      this.clickItemSeccion(seccionSelecc);
    }
  }

  clickMarca(marcaSelecc: MarcaAudio){
    if(!this.identDispServ.isPortrait()){
      this.seleccionarMarca(marcaSelecc);
    }
  }

  /**
     * Pone en reproduccion en bucle el audio de la seccion
     * @param seccion seccion a poner en bucle
     */
    setBucleSeccion(seccion:SeccionAudio){
      this.ctrlWs.setBucleSeccion(seccion);
    }
  
    /**
     * Pone en reproduccion en bucle el audio de la marca
     * @param marca marca a poner en bucle
     */
    setBucleMarca(marca:MarcaAudio){
      this.ctrlWs.setBucleMarca(marca);
    }
  
    /**
     * Reproduce la region desde el inicio
     * @param region region a reproducir desde el inicio
     */
    playRegionDesdeInicio(region: Region){
      region.play();
    }



  
}
