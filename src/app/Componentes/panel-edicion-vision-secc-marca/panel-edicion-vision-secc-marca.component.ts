import { Component, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { MarcaAudio, ModoVisionArchivo, ModoVisionReproductor, OrientacionReproductor, SeccionAudio } from '../../shared/interfaces/app.model';
import { ControlesWsService } from '../../shared/servicios/controles-ws.service';
import { SeleccionSeccionMarcaService } from '../../shared/servicios/seleccion-seccion-marca.service';
import { GestionSeccionesMarcasService } from '../../shared/servicios/gestion-secciones-marcas.service';
import { Color } from '../../shared/clases/Color';
import { IndexedDbService } from '../../shared/servicios/indexed-db.service';
import { Region } from 'wavesurfer.js/dist/plugins/regions.js';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IndentificarDispositivoService } from '../../shared/servicios/indentificar-dispositivo.service';
import { MarkdownModule, provideMarkdown } from 'ngx-markdown';
import { ConversorTiempo } from '../../shared/clases/ConversorTiempo';
import { PopUpEditarTextoSeccMarcComponent } from '../../Pop-ups/pop-up-editar-texto-secc-marc/pop-up-editar-texto-secc-marc.component';
import { distinctUntilChanged } from 'rxjs/operators';
import { ReproductorWsComponent } from '../reproductor-ws/reproductor-ws.component';

@Component({
  selector: 'app-panel-edicion-vision-secc-marca',
  standalone: true,
  imports: [CommonModule, FormsModule, MarkdownModule, PopUpEditarTextoSeccMarcComponent],
  providers: [provideMarkdown()],
  templateUrl: './panel-edicion-vision-secc-marca.component.html',
  styleUrl: './panel-edicion-vision-secc-marca.component.css'
})
export class PanelEdicionVisionSeccMarcaComponent implements OnChanges{

  @Input() modoInterfaz!: ModoVisionArchivo;

  //Para el mini reproductor de la pantalla completa
  reproductorWsComponent!: ReproductorWsComponent;

  //Referencias a los pop-up
  @ViewChild(PopUpEditarTextoSeccMarcComponent) 
  popUPEditarTextoComp!: PopUpEditarTextoSeccMarcComponent;

  modoVision: ModoVisionReproductor = ModoVisionReproductor.DIVIDIDO;
  orientacion: OrientacionReproductor = OrientacionReproductor.VERTICAL;

  seccionSeleccionada!: SeccionAudio | null;
  marcaSeleccionada!: MarcaAudio | null;

  marcaDesplegada: boolean = true;

  editarTituloSeccionMarca: boolean = false;

  isVisionTexto: boolean = true; //Solo en modo portrait

  //Definiciones necesarias para el html
  ModoVisionArchivo = ModoVisionArchivo;
  ModoVisionReproductor = ModoVisionReproductor;
  OrientacionReproductor = OrientacionReproductor;
  ConversorTiempo = ConversorTiempo;

  constructor(public ctrlWsServ: ControlesWsService, private seleccionServ: SeleccionSeccionMarcaService, private gestMarcSeccServ: GestionSeccionesMarcasService,
    private idbServ: IndexedDbService, public identDisServ: IndentificarDispositivoService
  ){

  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['modoInterfaz'] && changes['modoInterfaz'].currentValue !== undefined) {
      
      this.seleccionServ.seccionSeleccionada
      .pipe(
        distinctUntilChanged()
      )
      .subscribe(valor => {
        this.seccionSeleccionada = valor;
      });

      this.seleccionServ.marcaSeleccionada
      .pipe(
        distinctUntilChanged()
      )
      .subscribe(valor => {
        this.marcaSeleccionada = valor;
      });
      
    }
  }

  /**
   * Establece el reproductor que se usara para el modo pantalla completa en el modo lectura
   * @param reproductorWsComponent 
   */
  setReproductorWsComponent(reproductorWsComponent: ReproductorWsComponent){
    this.reproductorWsComponent = reproductorWsComponent;
  }

  /**
   * Cambia el modo de vision del reproductor
   * @param modoVision 
   */
  cambiarModoVision(modoVision: ModoVisionReproductor){
    this.modoVision = modoVision;
    this.orientacion = OrientacionReproductor.NINGUNA;
  }

  /**
   * Cambia la orientacion del reproductor (modo lectura)
   * @param orientacion 
   */
  cambiarOrientacion(orientacion: OrientacionReproductor){
    this.orientacion = orientacion;
    this.modoVision = ModoVisionReproductor.DIVIDIDO;
  }

  /**
   * Borra la seccion o marca seleccionada actualmente
   */
  borrarSeleccionada(){
    if(this.seccionSeleccionada){
      this.borrarSeccionEdicion();
    }
    else if(this.marcaSeleccionada){
      this.borrarMarcaEdicion();
    }
  }

  /**
   * Reproduce desde el inicio la seccion o marca seleccionada actualmente
   */
  playSeleccionada(){
    if(this.seccionSeleccionada){
      this.seccionSeleccionada.region.play();
    }
    else if(this.marcaSeleccionada){
      this.marcaSeleccionada.region.play();
    }
  }

  /**
   * Borra la seccion seleccionada
   */
  borrarSeccionEdicion(){
    
    if(this.seccionSeleccionada){
      let idSecc = this.seccionSeleccionada.separador.id;

      if(idSecc != "1"){ //La primera seccion no se puede borrar
        if(confirm("¿Eliminar la sección?")){
          
          //Quitamos el bucle de la seccion si lo habia
          let seccionBucle = this.ctrlWsServ.getSeccionBucle();

          if(seccionBucle){
            if(seccionBucle === this.seccionSeleccionada){
              this.ctrlWsServ.quitarBucle();
            }
          }

          //Borramos la seccion
          let indexSecc = this.gestMarcSeccServ.borrarSeccionPorId(idSecc);

          //Ponemos a la seccion de la izquierda como seccion a editar
          this.seleccionServ.seleccionarSeccionPorIndex(indexSecc-1);
        }
      }
      else{
        alert("La primera sección no se puede eliminar");
      }
    }
  }

  /**
   * Borra la marca seleccionada
   */
  borrarMarcaEdicion(){
    if(this.marcaSeleccionada){
      if(confirm("¿Borrar la marca?")){

        //Obtenemos el id de la marca
        let idMarca = this.marcaSeleccionada.region.id;

        let marcaBucle = this.ctrlWsServ.getMarcaBucle();

        //Quitamos la reproduccion en bucle de la marca si la habia
        if(marcaBucle){
          if(marcaBucle === this.marcaSeleccionada){
            this.ctrlWsServ.quitarBucle();
          }
        }

        //Borramos la marca de la coleccion
        let seccMarca = this.gestMarcSeccServ.borrarMarcaPorId(idMarca);

        //Seleccionamos la seccion en la que se encontraba la marca borrada
        this.seleccionServ.seleccionarSeccion(seccMarca);
      }
    }
  }

  /**
   * Asocia la imagen introducida a la seccion seleccionada actualmente
   * @param event 
   */
  async imagenSeccionEditarSeleccionada(event: any){
    if(this.seccionSeleccionada){
      //Borramos los datos anteriores si los habia 
      await this.borrarImagenSeccionEditar();

      //Asignamos la imagen seleccionada a la seccion
      let ficheroImagen = event.target.files[0];
      this.seccionSeleccionada.imagen.fichero = ficheroImagen;

      //Creamos un link para visualizar la imagen
      this.seccionSeleccionada.imagen.link = URL.createObjectURL(ficheroImagen);

      //Guardamos el nuevo fichero en la indexed db
      let idDb = await this.idbServ.cacheFile(ficheroImagen);
      this.seccionSeleccionada.imagen.idFicheroDB = idDb; 
    }  
  }

  /**
   * Borra la imagen que habia anteriormente en la seccion en edicion
   */
  async borrarImagenSeccionEditar(){
    if(this.seccionSeleccionada){
      this.seccionSeleccionada.imagen.fichero = null;

      //Borramos la imagen de la cache de imagenes
      if(this.seccionSeleccionada.imagen.link != null){
        await this.idbServ.deleteCachedFile(this.seccionSeleccionada.imagen.idFicheroDB as string);

        this.seccionSeleccionada.imagen.idFicheroDB = null;
        this.seccionSeleccionada.imagen.link = null;
      }
    }
  }

  /**
   * Cambia el color de la seccion que se encuentra en edicion actualmente, utilizando
   * como valor el obtenido en event
   * @param event 
   */
  cambiarColorSeccionEditar(event: any){
    if(this.seccionSeleccionada){
      let color = event.target.value;
      let colorConTransparencia = Color.hexToRgba(color, 0.5);

      this.seccionSeleccionada.region.setOptions(
        {
          start: this.seccionSeleccionada.region.start,
          color: colorConTransparencia
        });
    }
  }

  /**
   * Pone en reproduccion en bucle el audio de la seccion
   * @param seccion seccion a poner en bucle
   */
  setBucleSeccion(seccion:SeccionAudio){
    this.ctrlWsServ.setBucleSeccion(seccion);
  }

  /**
   * Pone en reproduccion en bucle el audio de la marca
   * @param marca marca a poner en bucle
   */
  setBucleMarca(marca:MarcaAudio){
    this.ctrlWsServ.setBucleMarca(marca);
  }
  
  /**
   * Reproduce la region desde el inicio
   * @param region region a reproducir desde el inicio
   */
  playRegionDesdeInicio(region: Region){
    region.play();
  }

  /**
   * Habilita la edicion del texto de la seccion o marca seleccionada actualmente
   */
  editarTexto(){
    if(this.seccionSeleccionada){
      this.popUPEditarTextoComp.editarTextoSeccion(this.seccionSeleccionada);
    }
    else if(this.marcaSeleccionada){
      this.popUPEditarTextoComp.editarTextoMarca(this.marcaSeleccionada);
    }
  }

    /**
   * Reproduce el wavesurfer desde el punto que representa el progreso de la barra, dado por event
   * @param event evento del progreso de la barra que representa al wavesurfer
   */
  seekTo(event:any) {
    const progressBar = event.currentTarget as HTMLDivElement; // Castear a HTMLDivElement
    const width = progressBar.clientWidth; // Obtener ancho del elemento
    const clickX = event.offsetX; // Obtener posición del clic dentro del elemento
    const progress = clickX / width; // Calcular progreso relativo
    this.ctrlWsServ.seekTo(progress); // Saltar a la posición
  }

  saltarASiguienteSeccion(){
    this.reproductorWsComponent.saltarASiguienteSeccion();
  }

  pausarAudioWs(){
    this.reproductorWsComponent.pausarAudioWs()
  }

  playAudioWs(){
    this.reproductorWsComponent.playAudioWs()
  }

  saltarAAnteriorSeccion(){
    this.reproductorWsComponent.saltarAAnteriorSeccion()
  }


  
}
