import { Component, ViewChild, OnInit, Renderer2, OnDestroy } from '@angular/core';
import { ModoCargaWavesurfer, ModoVisionArchivo, SeccionLectura } from '../../shared/interfaces/app.model';
import { ColeccionSecciones } from '../../shared/clases/ColeccionSecciones';
import { ActivatedRoute, RouterOutlet } from '@angular/router';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { LectorEscritorMkvService } from '../../shared/servicios/lector-escritor-mkv.service';
import { SeleccionSeccionMarcaService } from '../../shared/servicios/seleccion-seccion-marca.service';
import { ControlesWsService } from '../../shared/servicios/controles-ws.service';
import { PopUpIntroducirMkvComponent } from '../../Pop-ups/pop-up-introducir-mkv/pop-up-introducir-mkv.component';
import { PopUpIntroducirMp3Component } from '../../Pop-ups/pop-up-introducir-mp3/pop-up-introducir-mp3.component';
import { ReproductorWsComponent } from '../reproductor-ws/reproductor-ws.component';
import { IndentificarDispositivoService } from '../../shared/servicios/indentificar-dispositivo.service';
import { PopUpCargaComponent } from '../../Pop-ups/pop-up-carga/pop-up-carga.component';
import { PopUpErrorComponent } from '../../Pop-ups/pop-up-error/pop-up-error.component';
import { PopUpAgregarMarcaComponent } from '../../Pop-ups/pop-up-agregar-marca/pop-up-agregar-marca.component';
import { PopUpAgregarSeccMarcComponent } from '../../Pop-ups/pop-up-agregar-secc-marc/pop-up-agregar-secc-marc.component';
import { GestionSeccionesMarcasService } from '../../shared/servicios/gestion-secciones-marcas.service';
import { PanelEdicionVisionSeccMarcaComponent } from '../panel-edicion-vision-secc-marca/panel-edicion-vision-secc-marca.component';
import { ListaSeccionesMarcasComponent } from '../lista-secciones-marcas/lista-secciones-marcas.component';
import { ListaSeccionesMarcasAbreviadaComponent } from '../lista-secciones-marcas-abreviada/lista-secciones-marcas-abreviada.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-contenedor-lectura-escritura',
  standalone: true,
  imports: [RouterOutlet, CommonModule, FormsModule,  PopUpIntroducirMkvComponent, PopUpIntroducirMp3Component,
    ReproductorWsComponent, PopUpCargaComponent, PopUpErrorComponent, PopUpAgregarMarcaComponent, PopUpAgregarSeccMarcComponent,
    PanelEdicionVisionSeccMarcaComponent, ListaSeccionesMarcasComponent, ListaSeccionesMarcasAbreviadaComponent
  ],
  templateUrl: './contenedor-lectura-escritura.component.html',
  styleUrl: './contenedor-lectura-escritura.component.css'
})
export class ContenedorLecturaEscrituraComponent implements OnInit, OnDestroy{

  //Modo de la interfaz (edicion o lectura)
  modoInterfaz!: ModoVisionArchivo;

  //Referencias a los pop-up
  @ViewChild(PopUpIntroducirMkvComponent) 
  popUPintrodMkvComp!: PopUpIntroducirMkvComponent;

  @ViewChild(PopUpIntroducirMp3Component) 
  popUPintrodMp3Comp!: PopUpIntroducirMp3Component;

  @ViewChild(PopUpCargaComponent) 
  popUPCargaComp!: PopUpCargaComponent;

  @ViewChild(PopUpErrorComponent) 
  popUPErrorComp!: PopUpErrorComponent;

  @ViewChild(PopUpAgregarSeccMarcComponent) 
  popUPAgregarSeccMarcComp!: PopUpAgregarSeccMarcComponent;

  @ViewChild(PopUpAgregarMarcaComponent) 
  popUPAgregarMarcComp!: PopUpAgregarMarcaComponent;

  //Referencias a los componentes
  @ViewChild(ReproductorWsComponent) 
  reprWsComp!: ReproductorWsComponent;

  @ViewChild(ListaSeccionesMarcasComponent) 
  listaSeccComp!: ListaSeccionesMarcasComponent;

  @ViewChild(PanelEdicionVisionSeccMarcaComponent) 
  panelEdVisComp!: PanelEdicionVisionSeccMarcaComponent;

  //Informacion del archivo
  archivoLeido: File| null = null; //Archivo MKV introducido por el usuario
  nombreArchivo: string = "Nuevo Audio"; //Nombre del archivo mkv
  editarNombreArchivo: boolean = false; //Editar nombre del archivo mkv
  ficheroMp3: File|null = null; //Archivo MP3 introducido por el usuario

  //Objeto que maneja la informacion del audio (secciones y marcas)
  coleccionSecciones!: ColeccionSecciones;

  //Si esta cargado el wavesurfer
  wsCargado: boolean = false; 

  //Tipo de dispositivo desde el que se accede
  isMovilTablet!: boolean;

  //Definiciones necesarias para el html
  ModoVisionArchivo = ModoVisionArchivo;
  ModoCargaWavesurfer = ModoCargaWavesurfer;

  //Suscripcion al boton de agregar marcas y secciones del wavesurfer
  suscripcionBotonAgregarMarcSecc: Subscription | null = null

  constructor(private ruta: ActivatedRoute, private renderer: Renderer2,
    private lectorEscritorMkvServ: LectorEscritorMkvService,
    private seleccionService: SeleccionSeccionMarcaService, private ctrlWs: ControlesWsService,
    private identDispServ: IndentificarDispositivoService, private gestSeccMarcServ: GestionSeccionesMarcasService
  ){}

  /**
   * Metodo ejecutado al destruir el componente
   */
  ngOnDestroy(): void {
    this.suscripcionBotonAgregarMarcSecc?.unsubscribe();
  }

  /**
   * Metodo ejecutado al inicio. Obtiene datos sobre el modo de la interfaz y el tipo de dispositivo desde el que se accede
   */
  ngOnInit(): void {

    //Averiguamos en que modo nos encontramos, lectura o escritura
    let urlActual = this.ruta.snapshot.url;
    let modo = urlActual[urlActual.length - 1].path;

    if(modo === "crearArchivo"){
      this.modoInterfaz = ModoVisionArchivo.ESCRITURA;
    }
    else{
      this.modoInterfaz = ModoVisionArchivo.LECTURA;
    }

    //Miramos desde que tipo de dispositivo se esta accediendo (movil, tablet o pc)
    this.isMovilTablet = this.identDispServ.isDispositivoMovilTablet();

  }
  
  /**
   * Metodo ejecutado al pulsar en el boton de agregar un archivo MP3
   */
  abrirPopUpMp3(){
    this.popUPintrodMp3Comp.abrir();
  }

  /**
   * Metodo ejecutado al pulsar en el boton de agregar un archivo MKV
   */
  abrirPopUpMkv(){
    this.popUPintrodMkvComp.abrir();
  }

  /**
   * Detecta si el dispositivo desde el que se visualiza la pagina esta en modo vertical
   */
  isPortrait(): boolean{
    return this.identDispServ.isPortrait();
  }
  
  /**
   * Obtiene y guarda el archivo MKV del evento del input e inicia la carga de la interfaz
   * @param event evento de input que contiene el archivo mkv
   */
  introducirMkv(fichero: File){
    this.archivoLeido = fichero;
    this.cargarWavesurfer(ModoCargaWavesurfer.CARGAR);
  }

  /**
   * Obtiene y guarda el archivo mp3 del evento del input
   * @param event evento de input que contiene el archivo mp3 e inicia la carga de la interfaz
   */
  introducirNuevoAudio(fichero: File){
    this.ficheroMp3 = fichero;
    this.cargarWavesurfer(ModoCargaWavesurfer.NUEVO);
  }

  /**
   * Resetea el componente a su estado inicial
   */
  resetear(){
    this.wsCargado = false;
    this.nombreArchivo = "Nuevo Audio";
    this.editarNombreArchivo = false;
    
  }

  /**
   * Carga el wavesurfer en la interfaz e inicializa las variables de datos segun los datos introducidos por el usuario e la interfaz,
   * en modo CARGAR (carga los datos de un archivo mkv) o en modo NUEVO (crea un wavesurfer vacio a partir del mp3)
   * @param modo Modo de carga del wavesurfer
   */
  async cargarWavesurfer(modo: ModoCargaWavesurfer){

    //Comprobamos si se introdujo el archivo
    if( (this.modoInterfaz === ModoVisionArchivo.LECTURA && modo === ModoCargaWavesurfer.CARGAR && !this.archivoLeido) || 
    (this.modoInterfaz === ModoVisionArchivo.ESCRITURA && modo === ModoCargaWavesurfer.NUEVO && !this.ficheroMp3) ||
    (this.modoInterfaz === ModoVisionArchivo.ESCRITURA && modo === ModoCargaWavesurfer.CARGAR && !this.archivoLeido) ){
      //Mostramos un mensaje de error
      let mensajeError = "No se introdujo ningun archivo";
      this.popUPErrorComp.mostrarError(mensajeError);
    }

    //Se introdujo el archivo
    else{
      //Reseteamos al estado inicial
      this.resetear();

      //Mostramos el pop up de carga
      this.popUPCargaComp.abrir();

      try{
        let linkAudio = "";

        if(modo === ModoCargaWavesurfer.NUEVO && this.ficheroMp3){
          //Creamos un link para el audio
          let audioBlob = new Blob([this.ficheroMp3], { type: 'audio/mp3' });
          linkAudio = URL.createObjectURL(audioBlob);

          //Creamos el wavesurfer
          await this.crearReproductorEdicion(null, linkAudio);
        }
        else{ //Modo CARGAR 
          //Leemos el contenido del mkv
          let datos = await this.lectorEscritorMkvServ.recuperarDatosSecciones(this.archivoLeido as File);
          let seccionesLeidas = datos[0];
          this.ficheroMp3 = datos[1];
          linkAudio = URL.createObjectURL(this.ficheroMp3);

          //Creamos un reproductor wavesurfer con los datos de las secciones leiadas del mkv
          await this.crearReproductorEdicion(seccionesLeidas, linkAudio);
        }

        //Inicializamos el componente de reproductor wavesurfer y de la lista de secciones 
        this.reprWsComp.inicializar();
        this.panelEdVisComp.setReproductorWsComponent(this.reprWsComp);
        this.listaSeccComp.inicializar();

        //Quitamos el pop up de carga
        this.popUPCargaComp.cerrar()

      }catch(error){
        //Quitamos el pop up de carga
        this.popUPCargaComp.cerrar()

        //Mostramos un mensaje de error
        let mensajeError = "No se pudo leer el archivo";
        this.popUPErrorComp.mostrarError(mensajeError);
        console.log(error);
      }
    }
  }

  /**
   * Genera un MKV con los datos de la interfaz y comienza su descarga
   */
  async descargarMKV(){

    try{
      //Mostramos el pop up de carga
      this.popUPCargaComp.abrir();

      //Generamos el archivo MKV a partir de los datos
      let ficheroMkv = await this.lectorEscritorMkvServ.crearMKV(this.coleccionSecciones.getArraySecciones(), this.ficheroMp3 as File, this.nombreArchivo);

      //Quitamos el pop up de carga
      this.popUPCargaComp.cerrar();

      //Iniciamos la descarga del fichero mkv
      this.iniciarDescargaFichero(ficheroMkv);
      
    }catch(error:any){
      this.popUPCargaComp.cerrar();

      let mensajeError = "Ocurrió un error durante la generacion del archivo";
      this.popUPErrorComp.mostrarError(mensajeError);

      console.log(error);
    }
     
  }

  /**
   * Inicia la descarga en el navegador del fichero que se pasa como parametro
   * @param fichero Fichero a descargar
   */
  iniciarDescargaFichero(fichero: File){
    //Creamos un link de descarga para el fichero
    const blob = new Blob([fichero], { type: 'video/x-matroska' });
    const linkDescarga = URL.createObjectURL(blob);

    //Agregamos un elemento de link de descarga en el html
    const a = this.renderer.createElement('a');
    this.renderer.setProperty(a, 'href', linkDescarga);
    this.renderer.setProperty(a, 'download', `${this.nombreArchivo}.mkv`);
    this.renderer.setStyle(a, 'display', 'none');
    this.renderer.appendChild(document.body, a);

    //Iniciamos la descarga
    setTimeout(() => {
      a.click();
      this.renderer.removeChild(document.body, a);
      URL.revokeObjectURL(linkDescarga);
    }, 100);
  }

  /**
   * Crea un reproductor wavesurfer, inicializando la coleccion de secciones
   */
  async crearReproductorEdicion(seccionesLeidas: SeccionLectura[]|null, linkAudio: string){
    try{
      let wsElRef = this.reprWsComp.getWaveSurferRef();

      let ws = this.ctrlWs.inicializarWs(wsElRef, this.modoInterfaz);

      //Cuando se pulsa en un momento concreto del audio, se actualiza el tiempo actual
      if(this.modoInterfaz === ModoVisionArchivo.LECTURA){
        ws.on('seeking', () => {
           this.seleccionService.actualizarSeccionMarcaActual();
        });
        
        ws.on('audioprocess', async () => {
           this.seleccionService.actualizarSeccionMarcaActual();
        });
      }

      ws.on("ready", ()=>{
        this.wsCargado = true;

        let tTotal = this.ctrlWs.getTiempoTotal();
        let regionesPlugin = this.ctrlWs.getRegionsPlugin();

        //Creamos la estructura donde almacenaremos los datos del audio
        if(this.modoInterfaz === ModoVisionArchivo.LECTURA){ //Modo lectura
          if(seccionesLeidas){
            this.coleccionSecciones = new ColeccionSecciones(regionesPlugin, tTotal, ModoVisionArchivo.LECTURA, seccionesLeidas);
          }
          else{
            throw("No existe fichero mkv de entrada para su lectura");
          }
        }

        else{ //Modo escritura
          if(seccionesLeidas){ //Modo escritura con carga de mkv
            this.coleccionSecciones = new ColeccionSecciones(regionesPlugin, tTotal, ModoVisionArchivo.ESCRITURA, seccionesLeidas);
          }
          else{ //Modo escritura sin carga de mkv
            this.coleccionSecciones = new ColeccionSecciones(regionesPlugin, tTotal, ModoVisionArchivo.ESCRITURA, []);
          }
        }

        //Asignamos coleccion secciones a los servicios
        this.ctrlWs.setColeccionSecciones(this.coleccionSecciones);
        this.gestSeccMarcServ.inicializar(this.coleccionSecciones);
        this.seleccionService.inicializar(ws, this.coleccionSecciones);

        //Asignamos al boton de creacion del wavesurfer un popup u otro segun el modo de vision
        this.suscripcionBotonAgregarMarcSecc = this.ctrlWs.botonCrearSeccMarc.subscribe((boton)=>{
          if(boton){
            if(this.modoInterfaz === ModoVisionArchivo.ESCRITURA){
              boton.addEventListener('click', (event) => {  
                event.stopPropagation();
                
                this.popUPAgregarSeccMarcComp.abrir();
              });
            }
            else{
              boton.addEventListener('click', (event) => {  
                event.stopPropagation();
                
                this.popUPAgregarMarcComp.abrir();
              });
            }
          }
        })
        
      });

      //Cargamos el wavesurfer
      await ws.load(linkAudio);

    }catch(error){
      let mensajeError = "Ocurrió un error durante la creacion del reproductor. Es posible que el archivo introducido no sea válido";
      this.popUPErrorComp.mostrarError(mensajeError);
      console.log(error);
    }
  }
  
}
