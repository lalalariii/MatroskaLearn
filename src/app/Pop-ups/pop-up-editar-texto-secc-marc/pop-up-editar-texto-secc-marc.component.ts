import { Component, ElementRef, ViewChild } from '@angular/core';
import { Modal } from 'bootstrap';
import { MarcaAudio, SeccionAudio } from '../../shared/interfaces/app.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MarkdownModule, provideMarkdown } from 'ngx-markdown';

@Component({
  selector: 'app-pop-up-editar-texto-secc-marc',
  standalone: true,
  imports: [CommonModule, FormsModule, MarkdownModule],
  providers: [provideMarkdown()],
  templateUrl: './pop-up-editar-texto-secc-marc.component.html',
  styleUrl: './pop-up-editar-texto-secc-marc.component.css'
})
export class PopUpEditarTextoSeccMarcComponent {

  @ViewChild('popUpEdicionTexto') popUpRef!: ElementRef;
  private popUp!: Modal;

  texto: string = "";
  isMarkdown: boolean = false;
  
  seccion: SeccionAudio | null = null;
  marca: MarcaAudio | null = null;

  ngAfterViewInit() {
    this.popUp = new Modal(this.popUpRef.nativeElement);
  }

  editarTextoSeccion(seccion: SeccionAudio){
    this.seccion = seccion;
    this.texto = seccion.texto;
    this.isMarkdown = seccion.isTextoMarkdown;
    this.popUp.show();
  }
  
  editarTextoMarca(marca: MarcaAudio){
    this.marca = marca;
    this.texto = marca.texto;
    this.isMarkdown = false;
    this.popUp.show();
  }

  guardarYSalir(){
    if(this.seccion){
      this.seccion.texto = this.texto;
      this.seccion.isTextoMarkdown = this.isMarkdown;
    }
    else if(this.marca){
      this.marca.texto = this.texto;
    }

    this.seccion = null;
    this.marca = null;

    this.popUp.hide();
  }

}
