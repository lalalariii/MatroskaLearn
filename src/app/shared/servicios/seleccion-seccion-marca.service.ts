import { Injectable } from '@angular/core';
import WaveSurfer from 'wavesurfer.js';
import { ColeccionSecciones } from '../clases/ColeccionSecciones';
import { MarcaAudio, SeccionAudio } from '../interfaces/app.model';
import { ValidadorFicheros } from '../clases/ValidadorFicheros';
import { IndexedDbService } from './indexed-db.service';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SeleccionSeccionMarcaService {

  waveSurfer!: WaveSurfer;
  colSecciones!: ColeccionSecciones;
  secciones!: SeccionAudio[];

  //Seccion y marca que se estan visualizando actualmente
  seccSelSubject = new BehaviorSubject<SeccionAudio | null>(null);
  marcSelSubject = new BehaviorSubject<MarcaAudio | null>(null);

  seccionSeleccionada = this.seccSelSubject.asObservable();
  marcaSeleccionada = this.marcSelSubject.asObservable();

  constructor(private idbServ: IndexedDbService) { 
  }

  inicializar(waveSurfer: WaveSurfer, colSecciones: ColeccionSecciones){

    this.quitarItemEnEdicion();
    
    //Asignamos los datos a las variables del servicio
    this.colSecciones = colSecciones;
    this.waveSurfer = waveSurfer;
    this.secciones = colSecciones.getArraySecciones();

    //Seleccionamos la primera seccion
    this.seleccionarSeccion(this.secciones[0]);
  }

  /**
   * Actualiza la seccion seleccionada y marca seleccionada (si la hay) segun el tiempo
   * actual de reproduccion del wavesurfer (usada solo en MODO LECTURA)
   */
  actualizarSeccionMarcaActual(){
    let tActual = this.waveSurfer.getCurrentTime();

    //Detectar en que seccion estamos
    let seccionActual = this.secciones.find(seccion => seccion.region.end > tActual);
    if(seccionActual){
      //await this.seleccionarSeccion(seccionActual);
      //Quitamos la seleccion de la anterior seccion y seleccionamos la actual
      this.quitarSeleccionSecc();

      seccionActual.seleccionada = true;
      this.seccSelSubject.next(seccionActual);

      if(seccionActual){
        let marcasSeccion = seccionActual.marcas;
        if(marcasSeccion.length != 0){
          let marcaActual = marcasSeccion.find(marca => marca.region.start <= tActual && marca.tiempo_fin > tActual);
          if(marcaActual){
            this.quitarSeleccionMarca();

            marcaActual.seleccionada = true;
            this.marcSelSubject.next(marcaActual);
          }
          else{
            this.quitarSeleccionMarca();
            this.marcSelSubject.next(null);
          }
        }
        else{
          this.quitarSeleccionMarca();
          this.marcSelSubject.next(null);
        }
      }
    }
  }

  quitarSeleccionMarca(){
    let marcaAnterior = this.marcSelSubject.getValue();
    if(marcaAnterior){
      marcaAnterior.seleccionada = false;
    }
  }

  quitarSeleccionSecc(){
    let seccionAnterior = this.seccSelSubject.getValue();
    if(seccionAnterior){
      seccionAnterior.seleccionada = false;
    }
  }

  /**
   * Quita la seccion o marca que se encontraba anteriormente seleccionada (si la habia)
   */
  quitarItemEnEdicion(){
    // Quitamos la seccion en edicion anterior si la habia
    let seccSel = this.seccSelSubject.getValue();
    let marcSel = this.marcSelSubject.getValue();

    if(seccSel != null){
      seccSel.seleccionada = false;
      this.seccSelSubject.next(null);
    }
    //Quitamos la marca en edicion anterior si la habia
    else if(marcSel != null){
      marcSel.seleccionada = false;
      this.marcSelSubject.next(null);
    }
    
  }

  seleccionarSeccionPorIndex(indexSecc: number){
    let seccion = this.secciones[indexSecc];

    this.seleccionarSeccion(seccion);
  }

  seleccionarMarcaPorIndex(indexMarc: number){
    let seccion = this.secciones[indexMarc];

    this.seleccionarSeccion(seccion);
  }

  /**
     * Selecciona la seccion a editar
     * @param seccionSelecc seccion a editar
     */
    async seleccionarSeccion(seccionSelecc: SeccionAudio){
      
      this.quitarItemEnEdicion();
  
      //Ponemos la seccion seleccionada en edicion
      seccionSelecc.seleccionada = true;
  
      let ficheroImagen = seccionSelecc.imagen.fichero;
  
      //Recuperamos la imagen de la indexed db si no esta disponible
      if(ficheroImagen != null){
  
        let isFicheroValido = await ValidadorFicheros.isFileValido(ficheroImagen);
        
        if(!isFicheroValido){
          seccionSelecc.imagen.fichero = await this.idbServ.getCachedFile(seccionSelecc.imagen.idFicheroDB as string);
          seccionSelecc.imagen.link = URL.createObjectURL(seccionSelecc.imagen.fichero as File);
        }
      }
      
      if(seccionSelecc == null){
        console.log("next null: "+seccionSelecc)
      }
     
      this.seccSelSubject.next(seccionSelecc);
    }

    /**
     * Selecciona la marca a editar
     * @param marcaSelecc marca a editar
     */
    seleccionarMarca(marcaSelecc: MarcaAudio){
       this.quitarItemEnEdicion();
  
        //Ponemos la marca seleccionada en edicion
        marcaSelecc.seleccionada = true;
        this.marcSelSubject.next(marcaSelecc);
    }

}
