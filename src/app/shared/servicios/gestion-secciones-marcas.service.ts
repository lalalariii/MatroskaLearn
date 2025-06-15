import { Injectable } from '@angular/core';
import { ColeccionSecciones } from '../clases/ColeccionSecciones';
import { MarcaAudio,  SeccionAudio} from '../interfaces/app.model';
import { Region } from 'wavesurfer.js/dist/plugins/regions.js';

@Injectable({
  providedIn: 'root'
})
export class GestionSeccionesMarcasService {

  coleccionSecciones!: ColeccionSecciones;
  secciones!: SeccionAudio[];
  cursor!: Region;

  constructor() { }

  inicializar(coleccionSecciones: ColeccionSecciones){
    this.coleccionSecciones = coleccionSecciones;
    this.secciones = coleccionSecciones.getArraySecciones();
    this.cursor = coleccionSecciones.getCursor();
  }

  getArraySecciones(): SeccionAudio[]{
    return this.secciones;
  }

  /**
   * Crea una marca vacia en la posicion en la que se encuentra el cursor
   */
  crearMarcaVaciaEnCursor(): MarcaAudio{
    //Obtenemos el tiempo donde debemos crear la marca
    let tiempoMarca = this.cursor.start;
    
    //Creamos la marca y la ponemos como marca seleccionada
    return this.coleccionSecciones.agregarNuevaMarca(tiempoMarca, "", null);
  }

  crearMarcaEnCursor(titulo: string, texto: string): MarcaAudio{
    //Obtenemos el tiempo donde debemos crear la marca
    let tiempoMarca = this.cursor.start;

    //Creamos la marca y la ponemos como marca seleccionada
    return this.coleccionSecciones.agregarNuevaMarca(tiempoMarca, texto, titulo);
  }

  /**
   * Divide la seccion en la que se encuentra el cursor justo por este punto, dando lugar
   * a dos secciones que comparten los mismos datos
   */
  dividirSeccion(): SeccionAudio {
    //Obtenemos el tiempo en el que se encuentra el cursor actualmente
    const tiempoCursor = this.cursor.start; 

    //Dividimos la seccion por el tiempo del cursor
    let seccionDerecha = this.coleccionSecciones.dividirSeccion(tiempoCursor);
      
    return seccionDerecha;
  }

  borrarSeccionPorId(idSeccion: string): number{
    return this.coleccionSecciones.borrarSeccionPorId(idSeccion);
  }

  borrarMarcaPorId(idMarca: string): SeccionAudio{
    return this.coleccionSecciones.borrarMarcaPorId(idMarca);
  }



}
