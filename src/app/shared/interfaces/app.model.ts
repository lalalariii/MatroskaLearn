import { Region } from "wavesurfer.js/dist/plugins/regions.js"

//INTERFACES
export interface SeccionAudio{
    titulo: string | null,
    imagen: ImagenSeccion,
    texto: string,
    isTextoMarkdown: boolean,
    mostrarDesplMarcas: boolean,
    marcas: MarcaAudio[],
    separador: Region,
    region: Region,
    seleccionada: boolean,
    bucle: boolean
}

export interface ImagenSeccion{
    fichero: File | null,
    link: string | null,
    idFicheroDB: string | null
}

export interface MarcaAudio{
    titulo: string | null,
    tiempo_fin: number,
    texto: string,
    region: Region,
    seleccionada: boolean,
    bucle: boolean
}

export interface SeccionLectura {
    titulo: string,
    tiempo_inicio: number,
    tiempo_fin: number,
    color: string,
    texto: string,
    isTextoMarkdown: boolean,
    isImagen: boolean,
    imagen: ImagenSeccion,
    marcas: MarcaLectura[]
  }
  
export interface MarcaLectura {
    titulo: string,
    tiempo_inicio: number,
    tiempo_fin: number,
    texto: string
}

//ENUMS
export enum TipoRegion{
    SECCION,
    CURSOR,
    SEPARADOR,
    MARCA
}

export enum ModoVisionArchivo{
    ESCRITURA,
    LECTURA
}

export enum ModoCargaWavesurfer{
    CARGAR,
    NUEVO
}

export enum ModoVisionReproductor{
    IMAGEN,
    TEXTO,
    DIVIDIDO
}

export enum OrientacionReproductor{
    HORIZONTAL,
    VERTICAL,
    NINGUNA
}