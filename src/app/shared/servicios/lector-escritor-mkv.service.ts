import { Injectable } from '@angular/core';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';
import { MarcaLectura, SeccionAudio, SeccionLectura } from '../interfaces/app.model';
import { ValidadorFicheros } from '../clases/ValidadorFicheros';
import { IndexedDbService } from './indexed-db.service';

@Injectable({
  providedIn: 'root'
})
export class LectorEscritorMkvService {

  constructor(private idbServ: IndexedDbService){}
  
    async crearMKV(secciones: SeccionAudio[], ficheroMp3: File, nombreArchivo: string): Promise<File>{
        
        let ffmpeg = await this.cargarFfmpeg();

        //Cargamos en el sistema de ficheros virtual de ffmpeg.wasm el audio y las imagenes de entrada

        //Audio
        try{
          await ffmpeg.writeFile("audioBruto.mp3", await fetchFile(ficheroMp3 as File));

          //Quitamos la caratula o cualquier cosa que contenga el stream de video del audio
          await ffmpeg.exec(['-i', 'audioBruto.mp3', '-map', '0:a', '-c:a', 'copy', 'audio.mp3']);

        }catch(error){
          console.log("error al cargar el audio")
        }
        
        //Imagenes
        
          for(let i=0; i<secciones.length; i++){
            console.log("i "+i+ ": "+ secciones[i].imagen.fichero + " tamaño fichero: "+ secciones[i].imagen.fichero?.size)
          }
          
          for(let i=0; i<secciones.length; i++){
            

            let ficheroImagen = secciones[i].imagen.fichero;
            let idIndexDb = secciones[i].imagen.idFicheroDB;
  
            if(ficheroImagen != null){ //Si hay imagen en la seccion
              let extensionFich = ficheroImagen.name.split('.').pop();
  
              try{
                //Recuperamos la imagen de la indexed db si ha sido borrada de la cache
                let isFileValido = await ValidadorFicheros.isFileValido(ficheroImagen);
                if(!isFileValido){
                  ficheroImagen = await this.idbServ.getCachedFile(idIndexDb as string);
                }
                
                //Cargamos la imagen en ffmpeg
                await ffmpeg.writeFile(`imagen${i}.${extensionFich}`, await fetchFile(ficheroImagen as File));

            }catch(error){
              console.log("error al cargar las imagenes "+ i)
              console.log(error)
            }
            }
            
          }
        
        

        //Variable donde almacenaremos el comando ffmpeg a ejecutar
        const comandoFfmpeg = [];

        //Input de audio
        comandoFfmpeg.push('-i', 'audio.mp3'); 

        //Input de las imagenes de todas las secciones
        for (let i = 0; i < secciones.length; i++) {
          let ficheroImagen = secciones[i].imagen.fichero;

          if(ficheroImagen != null){
            let extensionFich = ficheroImagen.name.split('.').pop();

            comandoFfmpeg.push('-i', `imagen${i}.${extensionFich}`);
          }
          
        }

        //Mapeamos el audio como stream 0
        comandoFfmpeg.push('-map', '0'); 

        let indexMap = 0;

        //Mapeamos cada imagen como un stream adicional (desde el 1 al numero de imagenes total)
        for(let i =0; i<secciones.length; i++){
          if(secciones[i].imagen.fichero != null){
            
            comandoFfmpeg.push('-map', `${++indexMap}`); 
          }
        }

        //Guardamos como un metadato personalizado el numero de imagenes (streams de video) que contiene el mkv (para poder leerlas despues)
        comandoFfmpeg.push('-metadata', `NUM_SECCIONES=${secciones.length}`);

        
        //Introducimos la informacion de cada seccion (tiempo de inicio y fin, titulo y texto) en los metadatos del mkv
        for(let i=0; i<secciones.length; i++){

          //Informacion de la seccion
          let seccion = secciones[i];

          comandoFfmpeg.push(`-metadata`);

          let infoSeccion = this.seccionAudioToSeccionLectura(seccion);
          
          let infoSeccionJson = JSON.stringify(infoSeccion);

          comandoFfmpeg.push(`SECCION_${i}=`+infoSeccionJson);
        }

        //Guardar en el mkv sin recodificar (no se procesa el video)
        comandoFfmpeg.push('-c', 'copy', `${nombreArchivo}.mkv`);

        console.log(comandoFfmpeg)

        console.log("CREANDO EL MKV...");

        //Ejecutamos el comando creado
        await ffmpeg.exec(comandoFfmpeg);

        console.log("MKV CREADO");

        //Recupera del sistema de ficheros virtual de ffmpeg el archivo resultado
        const resultado = await ffmpeg.readFile(`${nombreArchivo}.mkv`);

        //Finaliza el worker con ffmpeg.wasm
        ffmpeg.terminate();

        //Convertimos el archivo obtenido en Uint8Array
        let mkvUint8Array: Uint8Array = new Uint8Array(resultado as ArrayBuffer); //mirar si se puede con fetch file tambien

        return new File([mkvUint8Array], "resultado.mkv", { type: "video/x-matroska" });
    }

    

    async cargarFfmpeg(): Promise<FFmpeg>{
      const ffmpeg = new FFmpeg();

      /*Carga ffmpeg dentro de un web worker
        Todos los archivos necesarios para la carga se encuentran en public/ffmpeg-core, almacenados en local*/
      const basePath = document.baseURI || '/';

      await ffmpeg.load({
        coreURL: `${basePath}ffmpeg-core/ffmpeg-core.js`,
        wasmURL: `${basePath}ffmpeg-core/ffmpeg-core.wasm`,
        classWorkerURL: `${basePath}ffmpeg-core/worker.js`
      });

      if(ffmpeg.loaded){
        console.log("FFMPEG CARGADO");
      }

      //Activamos el log de ffmpeg para visualizarlo por consola
      /*ffmpeg.on('log', ({ message }) => {
        console.log(`FFmpeg log: ${message}`);
      });*/

      return ffmpeg;
    }

    /**
   * Recupera los datos del mkv introducido: fecha de inicio y fin, titulo, texto y link de imagen de cada seccion y link del audio mp3
   * y los almacena en seccionesAudioRecuperadas y linkAudio
   */
  async recuperarDatosSecciones(ficheroMKV: File):Promise<[SeccionLectura[], File]>{
    
    //Cargamos ffmpeg
    let ffmpeg = await this.cargarFfmpeg();

    //Metemos el fichero mkv en el sistema de archivos de ffmpeg
    await ffmpeg.writeFile("entrada.mkv", await fetchFile(ficheroMKV));

    //Extraemos el audio del mkv
    console.log("Extrayendo el audio...");

    let fileAudio;

    try{
      await ffmpeg.exec(['-i', 'entrada.mkv', '-map', '0:a', '-c', 'copy', 'audio.mp3']);

      const audioFileData = await ffmpeg.readFile('audio.mp3');
      let audioUint8Array: Uint8Array = new Uint8Array(audioFileData as ArrayBuffer);

      //Obtenemos el fichero de audio
      fileAudio = new File([audioUint8Array], 'audio.mp3', { type: 'audio/mpeg' });

    }catch(error){
      console.error("Error al extraer el audio: "+error);
    }

    console.log("Audio extraido");

    //Extraemos los metadatos del mkv (numero de streams de video e informacion de los segmentos)
    console.log("Extrayendo los metadatos...")

    let seccionesLeidas;

    try{
      await ffmpeg.exec(['-i', 'entrada.mkv', '-f', 'ffmetadata', 'metadatos.txt']);

      const metadatosFileData = await ffmpeg.readFile('metadatos.txt');

      //Convertimos el contenido del fichero a texto
      let metadatosTexto = new TextDecoder().decode(metadatosFileData as ArrayBuffer);

      seccionesLeidas = this.extraerMetadatosSecciones(metadatosTexto);

      console.log(seccionesLeidas);

      //Extraemos las imagenes de cada seccion (si las tienen)
      let indexImagen = 1;
      for(let i=0; i<seccionesLeidas.length; i++){
        let seccion = seccionesLeidas[i];
        
        if(seccion.isImagen){
          //Obtenemos la imagen como fichero
          let nombreFichero = `imagen${indexImagen}.png`;
          await ffmpeg.exec(['-i', 'entrada.mkv', '-map', `0:${indexImagen}`, '-frames:v', '1', nombreFichero]);

          let imagenFileData = await ffmpeg.readFile(nombreFichero);
          let imagenUint8Array: Uint8Array = new Uint8Array(imagenFileData as ArrayBuffer);
          let imagenFile =  new File([imagenUint8Array], "imagen.png", { type: "image/png" });

          //Guardamos la imagen en la indexed db
          let idDB = await this.idbServ.cacheFile(imagenFile);

          //Creamos un link para la imagen
          let linkImagen = URL.createObjectURL(imagenFile);

          //Guardamos los datos obtenidos en la seccion
          seccion.imagen = {fichero: imagenFile, link: linkImagen, idFicheroDB: idDB};

          indexImagen++;
        }
      }

      //Finaliza el worker con ffmpeg.wasm
      ffmpeg.terminate();

      

    }catch(error){
      console.error("Error al extraer las imagenes: "+error);
    }
    
    return [seccionesLeidas as SeccionLectura[], fileAudio as File];
  }

  extraerMetadatosSecciones(metadatos: string): SeccionLectura[]{

    //Dividimos el contenido del fichero en lineas
    const lineas = metadatos.split("\n"); 

    //Obtenemos el numero de secciones
    let lineaNumSecc = lineas.find(linea => linea.startsWith("NUM_SECCIONES="));
    let partesLinea = lineaNumSecc!.split("="); //Poner esto bien para gestionar el error de no encontrar esa linea
    let numSecciones = parseInt(partesLinea[1], 10);

    //Inicializamos un array con ese numero de secciones
    const secciones: SeccionLectura[] = new Array(numSecciones);

    //Extraemos los datos de cada seccion contenidos en la linea
    lineas.forEach(linea => {

      let [clave, valor] = linea.split("=");
      if (!clave.startsWith("SECCION_")) return; //Nos saltamos las lineas que no sean de seccion

      //Extraemos el indice que tendra la seccion en el array
      const matchNumSecc = clave.match(/SECCION_(\d+)/);
      if (!matchNumSecc) return;
      const indiceSeccion = parseInt(matchNumSecc[1], 10);

      let seccion: SeccionLectura = JSON.parse(valor);

      //Decodificamos los saltos de linea y comillas en los textos
      seccion.texto = this.traducirJson(seccion.texto);
      seccion.marcas.forEach(marca => {
        marca.texto = this.traducirJson(marca.texto);
      });

      //Metemos la seccion en su indice correspondiente del array
      secciones[indiceSeccion] = seccion;
    });

    return secciones;
  }

  seccionAudioToSeccionLectura(seccionAudio: SeccionAudio): SeccionLectura{
    let seccionLectura: SeccionLectura = {
      titulo: seccionAudio.titulo as string,
      tiempo_inicio: seccionAudio.region.start,
      tiempo_fin: seccionAudio.region.end,
      color: seccionAudio.region.color,
      texto: this.adaptarJson(seccionAudio.texto),
      isTextoMarkdown: seccionAudio.isTextoMarkdown,
      isImagen: seccionAudio.imagen.fichero != null,
      imagen: {link: null, fichero: null, idFicheroDB: null},
      marcas: []
    };

    let marcasSeccAudio = seccionAudio.marcas;
    let marcasSeccLec: MarcaLectura[] = [];

    marcasSeccAudio.forEach(marca => {
      marcasSeccLec.push(
        {
          titulo: marca.titulo as string,
          tiempo_inicio: marca.region.start,
          tiempo_fin: marca.tiempo_fin,
          texto: this.adaptarJson(marca.texto)
        }
      );
    });

    seccionLectura.marcas = marcasSeccLec;

    return seccionLectura;
  }

  adaptarJson(texto:string): string{
    return texto.replace(/\n/g, "%n").replace(/"/g, "%c").replace(/#/g, "%h").replace(/=/g, "%i").replace(/;/g, "#p");
  }

  traducirJson(texto:string): string{
    return texto.replace(/%n/g, "\n").replace(/%c/g, "\"").replace(/%h/g, "#").replace(/%i/g, "=").replace(/%p/g, ";");
  }
}
