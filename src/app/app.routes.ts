import { Routes } from '@angular/router';
import { ContenedorLecturaEscrituraComponent } from './Componentes/contenedor-lectura-escritura/contenedor-lectura-escritura.component';

export const routes: Routes = [
    {path: 'crearArchivo', component: ContenedorLecturaEscrituraComponent},
    {path: 'leerArchivo', component: ContenedorLecturaEscrituraComponent},
    {path: '**', redirectTo: 'crearArchivo', pathMatch: 'full'}
];
