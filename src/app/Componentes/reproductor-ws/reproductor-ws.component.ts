import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ConversorTiempo } from '../../shared/clases/ConversorTiempo';
import { ControlesWsService } from '../../shared/servicios/controles-ws.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IndentificarDispositivoService } from '../../shared/servicios/indentificar-dispositivo.service';

@Component({
  selector: 'app-reproductor-ws',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reproductor-ws.component.html',
  styleUrl: './reproductor-ws.component.css'
})
export class ReproductorWsComponent implements OnInit{

  //Referencias a elementos de la interfaz
  @ViewChild('wavesurfer',{ static: false }) 
  waveSurferBRef!: ElementRef;

  zoomWs: number = 0; //Zoom actual
  volumenWs: number = 0.5; //Volumen actual
  tiempoActualWs: string = '00:00';
  tiempoTotalWs: string = '00:00';
  isPlayingWs: boolean = false;

  isMovilTablet!: boolean;

  constructor(private ctrlWs: ControlesWsService, private identDispServ: IndentificarDispositivoService){}

  ngOnInit(){
    //Miramos desde que tipo de dispositivo se esta accediendo (movil, tablet o pc)
    this.isMovilTablet = this.identDispServ.isDispositivoMovilTablet();
  }

  /**
   * Resetea a su estado inicial las variables del componente
   */
  resetear(){
    this.isPlayingWs = false;
    this.tiempoActualWs = "0:00";
    this.volumenWs = 0.5;
    this.zoomWs = 0;
  }

  /**
   * Inicializa las variables del componente
   */
  inicializar(){

    this.resetear();
    
    let ws = this.ctrlWs.getWaveSurfer();

    this.tiempoTotalWs = ConversorTiempo.segundosATextoMinutos(ws.getDuration());
    
    ws.on("audioprocess", ()=>{
      const tActual = ws.getCurrentTime();
      this.tiempoActualWs = ConversorTiempo.segundosATextoMinutos(tActual);
    });

    ws.on("seeking", ()=>{
      const tActual = ws.getCurrentTime();
      this.tiempoActualWs = ConversorTiempo.segundosATextoMinutos(tActual);
    });

    ws.on("play", ()=>{
      this.isPlayingWs = true;
    });

    ws.on("pause", ()=>{
      this.isPlayingWs = false;
    })
  }

  /**
   * Devuelve la referencia del wavesurfer en la interfaz
   * @returns 
   */
  getWaveSurferRef(): ElementRef{
    return this.waveSurferBRef;
  }

  /**
   * Pone el valor del volumen igual a volumenWs
   */
  setVolumen(){
    this.ctrlWs.setVolumen(this.volumenWs);
  }

  /**
   * Reproduce el audio del wavesurfer
   */
  playAudioWs(){
    this.ctrlWs.playAudioWs();
    this.isPlayingWs = true;
  }

  /**
   * Pasa a reproducir la siguiente seccion a la que se esta reproduciendo
   * actualmente
   */
  saltarASiguienteSeccion(){
    this.ctrlWs.saltarASiguienteSeccion();
  }

  /**
   * Pasa a reproducir la anterior seccion a la que se esta reproduciendo
   * actualmente
   */
  saltarAAnteriorSeccion(){
    this.ctrlWs.saltarAAnteriorSeccion();
  }

  /**
   * Pausa el audio del wavesurfer
   */
  pausarAudioWs(){
    this.ctrlWs.pausarAudioWs();
    this.isPlayingWs = false;
  }

   /**
   * Pone a 0 el volumen del wavesurfer
   */
   quitarVolumen(){
    this.ctrlWs.setVolumen(0);
    this.volumenWs = 0;
  }

  /**
   * Pone el zoom al valor indicado, restringiendolo a un minimo de 0 y maximo de 500
   * @param zoom 
   */
  cambiaZoom(zoom: number){
    this.zoomWs = Math.min(500, Math.max(0, zoom)); // Restringe a entre 0 y 500

    //Aplicamos el zoom
    this.ctrlWs.setZoom(this.zoomWs);
  }

}