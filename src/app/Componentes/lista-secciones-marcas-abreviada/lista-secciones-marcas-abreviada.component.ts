import { AfterViewInit, Component, ElementRef, Input, ViewChild } from '@angular/core';
import { ConversorTiempo } from '../../shared/clases/ConversorTiempo';
import { ListaSeccionesMarcasComponent } from '../lista-secciones-marcas/lista-secciones-marcas.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MarcaAudio, ModoVisionArchivo, SeccionAudio } from '../../shared/interfaces/app.model';
import { SeleccionSeccionMarcaService } from '../../shared/servicios/seleccion-seccion-marca.service';
import { Modal } from 'bootstrap';

@Component({
  selector: 'app-lista-secciones-marcas-abreviada',
  standalone: true,
  imports: [CommonModule, FormsModule, ListaSeccionesMarcasComponent],
  templateUrl: './lista-secciones-marcas-abreviada.component.html',
  styleUrl: './lista-secciones-marcas-abreviada.component.css'
})
export class ListaSeccionesMarcasAbreviadaComponent implements AfterViewInit{

  @Input() modoInterfaz!: ModoVisionArchivo;

  @ViewChild(ListaSeccionesMarcasComponent) 
  listaSeccMarcComp!: ListaSeccionesMarcasComponent;

  @ViewChild("popupListaSeccMarc") 
  popUpListaCompletaRef!: ElementRef;

  popUpListaCompleta!: Modal;
  
  ConversorTiempo = ConversorTiempo;
  ModoVisionArchivo = ModoVisionArchivo;

  seccionSeleccionada!: SeccionAudio | null;
  marcaSeleccionada!: MarcaAudio | null;

  constructor(private seleccionServ: SeleccionSeccionMarcaService ){
    
    //Nos suscribimos a los observables de marca y seccion seleccionada para conocer su valor
    this.seleccionServ.seccionSeleccionada.subscribe(valor => {
      this.seccionSeleccionada = valor;
    });

    this.seleccionServ.marcaSeleccionada.subscribe(valor => {
      this.marcaSeleccionada = valor;
    });
  }

  ngAfterViewInit(): void {
    this.popUpListaCompleta = new Modal(this.popUpListaCompletaRef.nativeElement);
  }

  /**
   * Abre la lista de secciones y marcas completa en un popup
   */
  abrirListaCompleta(){
    this.popUpListaCompleta.show();
    this.listaSeccMarcComp.inicializar();
  }

}
