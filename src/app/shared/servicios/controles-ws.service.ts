import { ElementRef, Injectable } from '@angular/core';
import WaveSurfer from 'wavesurfer.js';
import { ColeccionSecciones } from '../clases/ColeccionSecciones';
import { MarcaAudio, ModoVisionArchivo, SeccionAudio, SeccionLectura } from '../interfaces/app.model';
import RegionsPlugin, { Region } from 'wavesurfer.js/dist/plugins/regions.js';
import TimelinePlugin from 'wavesurfer.js/dist/plugins/timeline.js';
import { UtilidadesWs } from '../clases/UtilidadesWs';
import { ConversorTiempo } from '../clases/ConversorTiempo';
import { UtilidadesHtml } from '../clases/UtilidadesHtml';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ControlesWsService {

  private botonCrearSeccMarcSub = new BehaviorSubject<HTMLButtonElement | null>(null);
  botonCrearSeccMarc = this.botonCrearSeccMarcSub.asObservable(); // Exponemos el observable

  waveSurfer!: WaveSurfer;
  coleccionSecciones!: ColeccionSecciones;
  secciones!: SeccionAudio[];

  //Wavesurfer
  cursor!: Region; //Cursor usado para crear marcas y secciones
  haciendoZoom: boolean = false; //Si se esta haciendo zoom actualmente
  zoomWs!: number;
  regionsPlugin!: RegionsPlugin;

  modoInterfaz!: ModoVisionArchivo;

  //Control de bucle 
  seccionBucle: SeccionAudio|null = null;
  marcaBucle: MarcaAudio|null = null;

  constructor() { }

  inicializarWs(waveSurferRef: ElementRef, modoInterfaz: ModoVisionArchivo): WaveSurfer{

    this.resetear();
    
    this.modoInterfaz = modoInterfaz;
    this.crearReproductorEdicion(waveSurferRef);

    return this.waveSurfer;
  }

  resetear(){
    if(this.waveSurfer){
      this.waveSurfer.destroy();
    }
    this.seccionBucle = null;
    this.marcaBucle = null;
  }

  setColeccionSecciones(coleccionSecciones: ColeccionSecciones){
    this.coleccionSecciones = coleccionSecciones;

    //Obtenemos una ref al cursor y el array de secciones de la coleccion
    this.cursor = this.coleccionSecciones.getCursor();
    this.secciones = this.coleccionSecciones.getArraySecciones();

    //Colocamos el boton de crear marcas inicialmente en el cursor
    this.crearBotonAgregarMarca();

    //Al soltar el cursor, se reproducira el audio desde ese punto
    this.cursor.on("update-end", ()=>{
      this.waveSurfer.setTime(this.cursor.start);
      this.playAudioWs();

      //Colocamos el boton de crear secciones y marcas
      this.crearBotonAgregarMarca();
      
    });
  }

  /**
   * Crea un reproductor wavesurfer, inicializando la coleccion de secciones
   */
  crearReproductorEdicion(waveSurferRef: ElementRef){
    
    //Creamos los plugins del wavesurfer
    this.regionsPlugin = RegionsPlugin.create();
    let timeLinePlugin = TimelinePlugin.create();

    //Creamos el wavesurfer con los plugins
    this.waveSurfer = WaveSurfer.create({
      container: waveSurferRef.nativeElement,
      height: 80,
      waveColor: '#ddd',
      progressColor: '#ADB5C2',
      backend: "WebAudio",
      cursorColor: '#119DA4',
      cursorWidth: 2,
      barWidth: 4,
      barRadius: 30,
      minPxPerSec: 0,
      autoCenter: false,
      autoScroll: false,
      interact: false,
      plugins: [
        this.regionsPlugin,
        timeLinePlugin
      ]
    });
    
    //Scroll horizontal (presente al hacer zoom)
    this.waveSurfer.on('scroll', () => {
      if(!this.haciendoZoom){
        //Centramos la region moviendola para que se situe en el centro de la zona visible
        UtilidadesWs.centrarRegionHorizontalmente(this.waveSurfer.getWidth(), this.waveSurfer.getScroll(), this.cursor, this.zoomWs);
      }
    });

    //Zoom
    this.waveSurfer.on('zoom', (zoom) => {

      this.zoomWs = zoom;
      this.haciendoZoom = true; 

      //Centramos el scroll para que el cursor quede en el centro de la zona visible
      UtilidadesWs.centrarScrollEnTiempo(this.waveSurfer, this.cursor, zoom);

      //Reiniciamos el temporizador para indicar fin del zoom después de 100 ms sin actividad
      setTimeout(() => this.haciendoZoom = false, 100);
    });

    //Durante la reproduccion del audio
    this.waveSurfer.on('audioprocess', () => {
      this.enReproduccionDeAudioWs();
    });

    //Cuando el wavesurfer este cargado
    this.waveSurfer.on('ready', () => {
      this.inicioWs();
    });
    
  }

  /**
   * Funcion ejecutada despues de la carga del wavesurfer
   * @param seccionesLeidas secciones con las que se parte, extraidas del archivo mkv
   * @param regionesPlugin plugin regions conectado al wavesurfer
   */
  inicioWs(){
    //Inicializamos el zoom y volumen del wavesurfer
    this.waveSurfer.zoom(0);
    this.setVolumen(0.5);      
  }

   /**
   * Funcion ejecutada durante la reproduccion del wavesurfer
   */
  enReproduccionDeAudioWs(){
    //Actualizamos el tiempo que se muestra en la barra del reproductor
    const tActual = this.waveSurfer.getCurrentTime();

    //Bucles
    if(this.seccionBucle){
      if(Math.abs(tActual - this.seccionBucle.region.end) < 0.1){
        this.waveSurfer.setTime(this.seccionBucle.region.start);
      }
    }
    else if(this.marcaBucle){
      if(Math.abs(tActual - this.marcaBucle.tiempo_fin) < 0.1){
        this.waveSurfer.setTime(this.marcaBucle.region.start);
      }
    }
  }

  /**
   * Crea un boton al lado del cursor del wavesurfer y asocia su click a el despliegue
   * del modal popUp
   * @param popUp pop-up que se desplegara al pulsar el boton creado al lado del cursor
   */
  crearBotonAgregarMarca(){
    let botonAgregarWs = document.createElement("button");
    botonAgregarWs.textContent = "+";
    botonAgregarWs.setAttribute("type", "button")

    this.cursor.setContent(botonAgregarWs);

    let contenidoElem = this.cursor.element.querySelector('[part="region-content"]') as HTMLElement;
    UtilidadesHtml.sustituirPartAElementoHTML(contenidoElem, "contentCursorT", "contentButtoncursorT");

    this.botonCrearSeccMarcSub.next(botonAgregarWs);
  }

  /**
   * Devuelve el waveSurfer actualmente almacenado
   */
  getWaveSurfer(): WaveSurfer{
    return this.waveSurfer;
  }

  /**
   * Pone el valor del volumen igual a volumenWs
   */
  setVolumen(volumen: number){
    this.waveSurfer.setVolume(volumen);
  }

  setZoom(zoom: number){
    this.waveSurfer.zoom(zoom);
  }

  getTiempoTotal(): number{
    return this.waveSurfer.getDuration();
  }

  getRegionsPlugin(): RegionsPlugin{
    return this.regionsPlugin;
  }

  seekTo(porcentaje: number){
    this.waveSurfer.seekTo(porcentaje);
  }

  getSeccionBucle(): SeccionAudio | null{
    return this.seccionBucle;
  }

  getMarcaBucle(): MarcaAudio | null{
    return this.marcaBucle;
  }

  /**
   * Reproduce el audio del wavesurfer
   */
  playAudioWs(){
    this.waveSurfer.play();
  }

  /**
   * Pasa a reproducir la siguiente seccion a la que se esta reproduciendo
   * actualmente
   */
  saltarASiguienteSeccion(){
    let tiempoActual = this.waveSurfer.getCurrentTime();
    let indexSecc = this.coleccionSecciones.getIndexSeccionMarca(tiempoActual);

    if(indexSecc != this.secciones.length-1){
      let sigSecc = this.secciones[indexSecc+1];
      sigSecc.region.play();
    }
  }

  /**
   * Pasa a reproducir la anterior seccion a la que se esta reproduciendo
   * actualmente
   */
  saltarAAnteriorSeccion(){
    let tiempoActual = this.waveSurfer.getCurrentTime();
    let indexSecc = this.coleccionSecciones.getIndexSeccionMarca(tiempoActual);


    if(indexSecc != 0){
      let antSecc = this.secciones[indexSecc-1];
      antSecc.region.play();
    }
  }

  /**
   * Pausa el audio del wavesurfer
   */
  pausarAudioWs(){
    this.waveSurfer.pause();
  }

  /**
   * Pone en reproduccion en bucle el audio de la seccion
   * @param seccion seccion a poner en bucle
   */
  setBucleSeccion(seccion:SeccionAudio){

    seccion.bucle = !seccion.bucle;

    let bucle = seccion.bucle;

    if(bucle == true){ //Se activa el bucle
      this.quitarBucle();
      this.seccionBucle = seccion;
      this.waveSurfer.setTime(this.seccionBucle.region.start);
    }
    else{ //Se desactiva el bucle
      this.quitarBucle();
    }
  }

  /**
   * Pone en reproduccion en bucle el audio de la marca
   * @param marca marca a poner en bucle
   */
  setBucleMarca(marca:MarcaAudio){

    marca.bucle = !marca.bucle;

    let bucle = marca.bucle;

    if(bucle == true){ //Se activa el bucle
      this.quitarBucle();
      this.marcaBucle = marca;
      this.waveSurfer.setTime(this.marcaBucle.region.start);
    }
    else{ //Se desactiva el bucle
      this.quitarBucle();
    }
  }

  /**
   * Quita la seccion o marca que estaba en bucle anteriormente
   */
  quitarBucle(){
    if(this.seccionBucle){
      this.seccionBucle.bucle = false;
      this.seccionBucle = null;
    }
    if(this.marcaBucle){
      this.marcaBucle.bucle = false;
      this.marcaBucle = null;
    }
  }
}
