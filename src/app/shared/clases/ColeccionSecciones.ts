import { SeccionAudio, MarcaAudio, ImagenSeccion, TipoRegion, SeccionLectura } from "../interfaces/app.model";
import RegionsPlugin, { Region } from "wavesurfer.js/dist/plugins/regions.js";
import { ConversorTiempo } from "./ConversorTiempo";
import { Color } from "./Color";
import { ModoVisionArchivo } from "../interfaces/app.model";

export class ColeccionSecciones{

    secciones: SeccionAudio[] =[];

    numeroSeccion: number = 1;
    letraMarca: string = "A";

    tTotalAudio!: number;

    regionesPlugin!: RegionsPlugin;

    cursor!: Region;

    tipo!: ModoVisionArchivo;

    constructor(regionesPlugin: RegionsPlugin, tTotalAudio: number, tipo: ModoVisionArchivo, seccionesLectura: SeccionLectura[]){
        this.regionesPlugin = regionesPlugin;
        this.tTotalAudio = tTotalAudio;
        this.tipo = tipo;

        if(tipo === ModoVisionArchivo.ESCRITURA){ //Modo escritura
          if(seccionesLectura.length != 0){
            this.inicializarColeccionLectura(seccionesLectura, true);
          }
          else{
            this.inicializarColeccionEscritura();
          }
        }
        else{ //Modo lectura
          this.inicializarColeccionLectura(seccionesLectura, false);
        }
        
    }

    private inicializarColeccionLectura(seccionesLectura: SeccionLectura[], editable: boolean){

      //Creamos el cursor
      this.crearCursor();

      //Generamos las secciones (y sus marcas) cuyos datos contiene el array SeccionLectura
      seccionesLectura.forEach(seccion => {
        //Creamos la seccion
        let nuevaSeccion = this.crearNuevaSeccion(seccion.titulo, seccion.tiempo_inicio, seccion.tiempo_fin, seccion.imagen, seccion.texto, seccion.isTextoMarkdown, seccion.color, [], editable);

        let marcasSeccion = seccion.marcas;
        if(marcasSeccion.length != 0){

          //Creamos las marcas de la seccion
          let nuevasMarcas: MarcaAudio[] = [];
          marcasSeccion.forEach(marca => {
            let nuevaMarca = this.crearNuevaMarca(marca.titulo, marca.tiempo_inicio, marca.tiempo_fin, marca.texto, editable);
            nuevasMarcas.push(nuevaMarca);
          });

          //Asignamos las marcas a la seccion creada
          nuevaSeccion.marcas = nuevasMarcas;
        }

        //Agregamos la seccion al array de secciones
        this.secciones.push(nuevaSeccion);
      });
    }

    private crearCursor(){
      //Creamos el cursor y lo situamos a la mitad del audio
      this.cursor = this.crearRegionWs(this.tTotalAudio/2, this.tTotalAudio/2, null, TipoRegion.CURSOR, false);
    }

    /**
     * Inicializa la coleccion, creando una marca de tipo cursor y una seccion inicial
     * que ocupa todo el audio
     */
    private inicializarColeccionEscritura(){

      this.crearCursor();

      //Creamos la seccion inicial, que ocupa todo el audio
      let imagenNuevaSecc = this.crearNuevaImagenSeccionVacia();
      let seccionInicial = this.crearNuevaSeccion("Seccion 1", 0, this.tTotalAudio, imagenNuevaSecc, "", false, null, [], true);
      this.secciones.push(seccionInicial);
    }

    /**
     * Devuelve la region que se corresponde con el cursor del audio
     * @returns region que se corresponde con el cursor del audio
     */
    public getCursor(): Region{
      return this.cursor;
    }

    /**
     * Devuelve un array con todas las secciones del audio
     * @returns array con todas las secciones del audio
     */
    public getArraySecciones(): SeccionAudio[]{
      return this.secciones;
    }

    /**
     * Borra la seccion con id idSeccion y devuelve el index de la seccion eliminada
     * @param idSeccion id de la seccion a eliminar
     * @returns index de la seccion eliminada
     */
    public borrarSeccionPorId(idSeccion: string): number{

        //Buscamos el index de la seccion en edicion dentro del array de secciones
        let indexSecc = this.secciones.findIndex(seccion => seccion.separador.id === idSeccion);

        //Borramos la seccion y la juntamos con la de su izquierda
        this.juntarSecciones(indexSecc-1);
      
        return indexSecc;
    }
    
    /**
     * Junta la seccion con index indexSeccIzq con la seccion de su derecha, quedandose la seccion de la 
     * izquierda con todas las marcas que tuviera la seccion de la derecha. La seccion de la derecha es eliminada
     * @param indexSeccIzq 
     */
    private juntarSecciones(indexSeccIzq: number){

        //Seccion izquierda y derecha
        let seccionIzq = this.secciones[indexSeccIzq];
        let seccionDere = this.secciones[indexSeccIzq+1];

        //Obtenemos la lista de marcas de ambas secciones
        let marcasIzq = seccionIzq.marcas;
        let marcasDere = seccionDere.marcas;

        //Obtenemos la cantidad de marcas en cada lista
        let sizeMarcasIzq = marcasIzq.length;
        let sizeMarcasDere = marcasDere.length;

        let tiempoFinDere = seccionDere.region.end;

        if(sizeMarcasDere > 0){ //Si hay marcas en la region de la derecha
            if(sizeMarcasIzq > 0){
                //Ajustamos tiempo de fin de la ultima marca de la izquierda para que coincida con el inicio de la siguiente
                marcasIzq[sizeMarcasIzq-1].tiempo_fin = marcasDere[0].region.start;
            }
            //Juntamos todas las marcas en la lista de la izquierda
            seccionIzq.marcas = marcasIzq.concat(marcasDere);
        }
        else{//Si no hay marcas en la region derecha

            //Ajustamos el tiempo de fin de la ultima marca de la izquierda para que coincida con el fin de region derecha
            if(sizeMarcasIzq > 0){
                marcasIzq[sizeMarcasIzq-1].tiempo_fin = seccionDere.region.end;
            }
        }

        //Borramos las regiones de la seccion derecha
        seccionDere.region.remove();
        seccionDere.separador.remove();

        //Borramos la seccion de la derecha del array de secciones
        this.secciones.splice(indexSeccIzq+1,1);

        //Actualizamos el fin de la seccion de la izquierda para que coincida con el fin de la izquierda
        seccionIzq.region.setOptions({start: seccionIzq.region.start, end: tiempoFinDere});
    }

    /**
     * Borra la marca con el id especificado y devuelve la seccion en la que se encontraba la marca
     * @param idMarca id de la marca a borrar
     * @returns seccion que contenia a la marca eliminada
     */
    public borrarMarcaPorId(idMarca: string): SeccionAudio{

        //Buscamos el index de la seccion que contiene la marca
        let indexSeccion = this.buscarIndexSeccionMarca(idMarca);

        let seccMarca = this.secciones[indexSeccion];
        let marcasSecc = seccMarca.marcas;

        //Buscamos el index de la marca en la seccion
        let indexMarca = seccMarca.marcas.findIndex(marca => marca.region.id === idMarca);

        if(marcasSecc.length != 1){//Si habia mas marcas
          if(indexMarca == marcasSecc.length-1){//Si era la ultima marca
            //Modificamos el final de la anterior para que coincida con el final de la seccion
            marcasSecc[indexMarca-1].tiempo_fin = seccMarca.region.end; 
          }
          else{
            if(indexMarca != 0){//Si es una marca no es la primera ni la ultima (entremedias)
              marcasSecc[indexMarca-1].tiempo_fin = marcasSecc[indexMarca+1].region.start;
            }
          }
        }

        //Borramos la marca y su region asociada
        let marcaABorrar = seccMarca.marcas[indexMarca];
        marcaABorrar.region.remove();

        seccMarca.marcas.splice(indexMarca,1);

        return seccMarca;
    }

    /**
     * Devuelve el indice de la seccion que contiene a la marca de id idMarca
     * @param idMarca id de la marca a buscar
     * @returns indice de la seccion donde se encuentra la marca
     */
    private buscarIndexSeccionMarca(idMarca: string): number{

       return this.secciones.findIndex(seccion => seccion.marcas.some(marca => marca.region.id === idMarca));
    }

    /**
     * Devuelve la seccion a la que debe pertenecer una marca segun su tiempo
     * @param tiempoMarca tiempo en el que se ubica la marca
     */
    public getIndexSeccionMarca(tiempoMarca: number): number{

        return this.secciones.findIndex(seccion => seccion.region.start < tiempoMarca && seccion.region.end >= tiempoMarca);    
    }

    /**
     * Devuelve el indice de la seccion en la que se encuentra el segundo tiempo
     * @param tiempo tiempo en segundos del que se quiere saber a que seccion pertenece
     * @returns indice de la seccion en la que se encuentra ese momento de tiempo
     */
    private buscarSeccionPorTiempo(tiempo: number): number{

        return this.secciones.findIndex(seccion => seccion.region.start < tiempo && seccion.region.end >= tiempo);
    }

    /**
     * Crea una nueva marca en el tiempo tiempoMarca
     * @param tiempoMarca 
     * @returns marca creada en el tiempo tiempoMarca
     */
    public agregarNuevaMarca(tiempoMarca: number, textoMarca: string, tituloMarca:string|null): MarcaAudio{

      let indexSeccionMarca = this.getIndexSeccionMarca(tiempoMarca);
      let seccionMarca = this.secciones[indexSeccionMarca];

      if(seccionMarca != undefined){

        let titulo: string;
        if(tituloMarca == null){
          titulo = "Marca "+ this.letraMarca;
        }
        else{
          titulo = tituloMarca;
        }

        let nuevaMarca = this.crearNuevaMarca(titulo, tiempoMarca,0, textoMarca, true);

        seccionMarca.marcas.push(nuevaMarca); 

        //Ordenamos el array de marcas de menor a mayor tiempo
        seccionMarca.marcas.sort((a,b) => a.region.start - b.region.start);

        //Buscamos el index de la marca en el array despues de ser ordenado
        let indexMarca = seccionMarca.marcas.findIndex(marca => marca.region.id === nuevaMarca.region.id);

        if(indexMarca != -1){
          if(indexMarca == seccionMarca.marcas.length-1){ // Si no hay mas marcas posteriores a esta, su fin es el de la region
            nuevaMarca.tiempo_fin = seccionMarca.region.end;
          }
          else{ //Si hay una marca posterior a esta, el fin de esta sera el inicio de la posterior
            nuevaMarca.tiempo_fin = seccionMarca.marcas[indexMarca+1].region.start;
          }

          if(indexMarca != 0){// Si hay una marca antes que esta
            let marcaAnterior = seccionMarca.marcas[indexMarca-1];

            //Ajustamos el tiempo de fin de la marca anterior
            marcaAnterior.tiempo_fin = nuevaMarca.region.start;
          }
        }

        return nuevaMarca;
      }
      else{
        throw(new Error("Tiempo de la marca no valido"));
      }
    }
    /**
     * Divide la seccion por el segundo tiempoDivision, resultando dos secciones con
     * el mismo contenido de la seccion que se dividio. Devuelve la seccion derecha de entre las dos creadas
     * @param tiempoDivision Tiempo en segundos por el que se debe dividir la seccion
     * @returns seccion de la derecha resultante de la division de la original en dos secciones
     */
    public dividirSeccion(tiempoDivision: number): SeccionAudio{
  
        // Encontrar la región en la que se encuentra el tiempo de division
        let indiceSeccionADividir = this.buscarSeccionPorTiempo(tiempoDivision);
    
        if (indiceSeccionADividir != -1) {

            let seccionADividir = this.secciones[indiceSeccionADividir];

            //Extraemos el tiempo de fin de la region original
            let finSeccDere = seccionADividir.region.end;
        
            //Modificamos la region a dividir para convertirla en la region de la izquierda de la division
            seccionADividir.region.setOptions({start: seccionADividir.region.start, end: tiempoDivision});

            //Obtenemos la lista de marcas pertenecientes a la region de la derecha
            let marcasSeccIzqui = seccionADividir.marcas;
            let marcasSeccDere: MarcaAudio[] = [];

            //SI HAY MARCAS
            if(marcasSeccIzqui.length != 0){

                let separador = marcasSeccIzqui.findIndex(marca => marca.region.start > tiempoDivision);

                if(separador != -1){ // Si se han encontrado marcas posteriores que deben ser asignadas a la reg de la derecha
                //Borramos las marcas de la seccion de la izquierda, estas marcas borradas seran las de la secc dere
                marcasSeccDere = marcasSeccIzqui.splice(separador, marcasSeccIzqui.length-separador); 
                }
                
                if(marcasSeccIzqui.length != 0){
                //Ajustamos el tiempo de fin de la ultima marca de la region izquierda
                let ultMarcaIzqui = marcasSeccIzqui[marcasSeccIzqui.length-1];
                ultMarcaIzqui.tiempo_fin = tiempoDivision;
                }
                
            }
            
            //Creamos region de la derecha como una copia de la de la izquierda (excepto por los tiempos)
            let imagenSeccDerecha = this.crearNuevaImagenSeccionVacia();
            let seccionDerecha = this.crearNuevaSeccion("Seccion "+(this.numeroSeccion), tiempoDivision, finSeccDere, imagenSeccDerecha, seccionADividir.texto, false, null, marcasSeccDere, true);
            this.secciones.splice(indiceSeccionADividir+1, 0, seccionDerecha); //La insertamos justo despues de la reg izquierda
        
            return seccionDerecha;
        }

        else{
          throw new Error("No se pudo dividir la seccion");
        }
    }

    crearNuevaImagenSeccionVacia(): ImagenSeccion{
        return {
          fichero: null,
          link: null,
          idFicheroDB: null
        }
      }

    /**
     * Crea una nueva seccion con los parametros proporcionados
     * @param titulo 
     * @param segundoInicio 
     * @param segundoFin 
     * @param imagen 
     * @param texto 
     * @param marcas 
     * @returns 
     */
    public crearNuevaSeccion(titulo: string|null , segundoInicio: number,
        segundoFin: number, imagen: ImagenSeccion, texto: string, isTextoMarkdown: boolean, color: string | null, marcas: MarcaAudio[], editable:boolean): SeccionAudio{

        let region = this.crearRegionWs(segundoInicio, segundoFin, color, TipoRegion.SECCION, editable);
        let separador = this.crearRegionWs(segundoInicio, segundoInicio, null, TipoRegion.SEPARADOR, editable);

        return {
            titulo: titulo,
            imagen: imagen,
            texto: texto,
            isTextoMarkdown: isTextoMarkdown,
            mostrarDesplMarcas: false,
            marcas: marcas,
            separador: separador,
            region: region,
            seleccionada: false,
            bucle: false
        }
    }

    public crearNuevaMarca(titulo: string|null, segundoInicio: number, segundoFin: number, texto: string, editable: boolean): MarcaAudio{
      let region = this.crearRegionWs(segundoInicio, segundoInicio, null, TipoRegion.MARCA, editable);
  
      return {
        titulo: titulo,
        texto: texto,
        region: region,
        tiempo_fin: segundoFin,
        seleccionada: false,
        bucle: false
      }
    }

    /**
     * Crea una nueva region en el wavesurfer, con los parametros proporcionados
     * @param segundoInicio 
     * @param segundoFin 
     * @param tipoRegion 
     * @returns 
     */
    public crearRegionWs(segundoInicio: number, segundoFin: number, colorC: string|null, tipoRegion: TipoRegion, editable: boolean
      ): Region {
    
        let color;
        let contenido = undefined;
        let drag = false;
        let id = undefined;
    
        switch(tipoRegion){

          case TipoRegion.CURSOR:
            id = "cursorT";
            color = "#E63946";
            drag = true;
            break;
          
          case TipoRegion.MARCA:
            color = "#1D3557";
            contenido = `${this.letraMarca}`;
            drag = editable;
            id = `${this.letraMarca}`;
            this.letraMarca = String.fromCharCode(this.letraMarca.charCodeAt(0) + 1);
            break;
          
          case TipoRegion.SEPARADOR:
            color = "#1D3557";
            contenido = `${this.numeroSeccion}`;
            drag = (this.numeroSeccion == 1) ? false : editable;
            id = `${this.numeroSeccion}`;
            this.numeroSeccion++;
            break;
    
          case TipoRegion.SECCION:
            if(colorC == null){
              color = Color.generarColorAleatorio();
            }
            else{
              color = colorC;
            }
            
            break;
        }
    
        let nuevaRegion = this.regionesPlugin.addRegion({
          start: segundoInicio,
          end: segundoFin,
          content: contenido,
          color: color,
          drag: drag,
          resize: false,
          id: id
        });
    
        //Ajustamos el grosor de los marcadores de las regiones
        if(tipoRegion === TipoRegion.CURSOR){
          nuevaRegion.element.style.borderLeftWidth = "3.9px";
        }
        else{
          nuevaRegion.element.style.borderLeftWidth = "3px";
        }
        
    
        if(tipoRegion === TipoRegion.SECCION){
          nuevaRegion.element.style.zIndex = "1000";
        }
        
        else if(tipoRegion === TipoRegion.SEPARADOR){
          nuevaRegion.element.style.zIndex = "1001";
          nuevaRegion.element.style.color = "#1D3557";
    
          nuevaRegion.on("update",()=>{
            this.moverSeparacionSecciones(nuevaRegion);
          });
    
          nuevaRegion.on("update-end",()=>{
           this.comprobarSeparadorFueraDeRango(nuevaRegion);
          });
        } 
    
        else if(tipoRegion === TipoRegion.MARCA){
          nuevaRegion.element.style.zIndex = "1002";
          nuevaRegion.element.style.color = "#1D3557";
          nuevaRegion.element.style.borderLeftStyle = "dashed";
    
          nuevaRegion.on("update-end", ()=>{
            //Encontramos la marca y la borramos de la seccion anterior
            let indexSeccAntMarca = this.buscarIndexSeccionMarca(nuevaRegion.id);
            let seccAntMarca = this.secciones[indexSeccAntMarca];
            let indexAntMarca = seccAntMarca.marcas.findIndex(marca => marca.region.id === nuevaRegion.id);
            let marca = seccAntMarca.marcas[indexAntMarca];

            let indexSeccNuevaMarca = this.getIndexSeccionMarca(nuevaRegion.start);
            let seccNuevaMarca = this.secciones[indexSeccNuevaMarca];
    
            //Si la marca debe estar en una seccion distinta a la que estaba
            if(seccAntMarca != seccNuevaMarca){
  
              //Borramos la marca de la seccion anterior
              seccAntMarca.marcas.splice(indexAntMarca,1);
  
              //Ajustamos el fin de la ultima marca de la anterior seccion (si la hay)
              if(seccAntMarca.marcas.length != 0){
                let indexUltMarca = seccAntMarca.marcas.length - 1;
                seccAntMarca.marcas[indexUltMarca].tiempo_fin = seccAntMarca.region.end;
              }
              
              //Colocamos la marca en su seccion actual
              seccNuevaMarca.marcas.push(marca);
            }
    
            //Ordenamos el array de marcas de menor a mayor tiempo
            seccNuevaMarca.marcas.sort((a,b) => a.region.start - b.region.start);

            //Ajustamos el fin de la marca que era anterior a la que se movio
            if(indexAntMarca > 0){ //Si existia una marca anterior

              let indexMarcaIzqui = indexAntMarca-1;
              let marcaIzqui = seccAntMarca.marcas[indexMarcaIzqui];
              
              if(indexMarcaIzqui == seccAntMarca.marcas.length-1){ //Si es la ultima marca
                marcaIzqui.tiempo_fin = seccAntMarca.region.end;
              }
              else{ //Si no es la ultima marca
                marcaIzqui.tiempo_fin = seccAntMarca.marcas[indexMarcaIzqui+1].region.start; 
              }
            }
  
            //Buscamos el index de la marca en el array despues de ser ordenado
            let indexMarca = seccNuevaMarca.marcas.findIndex(m => m.region.id === marca.region.id);
  
            if(indexMarca != -1){
              //Ajustamos el tiempo de fin de la ultima marca
              seccNuevaMarca.marcas[seccNuevaMarca.marcas.length -1].tiempo_fin = seccNuevaMarca.region.end;
  
              if(indexMarca == seccNuevaMarca.marcas.length-1){ // Si no hay mas marcas posteriores a esta, su fin es el de la region
                marca.tiempo_fin = seccNuevaMarca.region.end;
              }
              else{ //Si hay una marca posterior a esta, el fin de esta sera el inicio de la posterior
                marca.tiempo_fin = seccNuevaMarca.marcas[indexMarca+1].region.start;
              }
  
              if(indexMarca != 0){// Si hay una marca antes que esta
                let marcaAnterior = seccNuevaMarca.marcas[indexMarca-1];
  
                //Ajustamos el tiempo de fin de la marca anterior
                marcaAnterior.tiempo_fin = marca.region.start;
              }
            }
          
        });
      }
  
      else if(tipoRegion == TipoRegion.CURSOR){
        nuevaRegion.element.style.zIndex = "1003";
  
        nuevaRegion.on("update", ()=>{
          //Marcador con el tiempo por donde se llega el cursor
          nuevaRegion.setContent(ConversorTiempo.segundosATextoMinutos(nuevaRegion.start));
  
          //Configuramos el estilo del marcador de tiempo
          let contenido = nuevaRegion.element.querySelector('[part="region-content"]') as HTMLElement;
        
          const currentParts = contenido.getAttribute('part') || ''; // Si no tiene 'part', usar cadena vacía
          contenido.setAttribute('part', `${currentParts} contentCursorT`.trim());
        });
  
        nuevaRegion.on("update-end", ()=>{
          
        });
  
      }
      return nuevaRegion;
    }

      moverSeparacionSecciones(separador: Region){
        //Encontramos el separador en el array de secciones
        let indexSeccDere = this.secciones.findIndex(seccion => seccion.separador.id == separador.id);

        if(indexSeccDere > 0){

          let seccionIzq = this.secciones[indexSeccDere-1];
          let seccionDere = this.secciones[indexSeccDere];
    
          let regionIzq = seccionIzq.region;
          let regionDere = seccionDere.region;
    
          if(separador.start == regionIzq.start+1){
            separador.setOptions({start: regionIzq.start+1, drag: false});
          }
    
          else if(separador.start == regionDere.end-1){
            separador.setOptions({start: regionDere.end-1, drag: false});
          }
          
          else{
            separador.setOptions({start: separador.start, drag: true});
            regionIzq.setOptions({start: regionIzq.start, end: separador.start});
            regionDere.setOptions({start: separador.start, end: regionDere.end});
          }
        }
      }

      private comprobarSeparadorFueraDeRango(separador: Region){

        //Encontramos el separador en el array de secciones
        let indexSeccDere = this.secciones.findIndex(seccion => seccion.separador.id === separador.id);

        if(indexSeccDere > 0){

          let seccionIzq = this.secciones[indexSeccDere-1];
          let seccionDere = this.secciones[indexSeccDere];

          let regionDere = seccionDere.region;
          let regionIzq = seccionIzq.region;
    
          if(separador.start <= regionIzq.start){

            separador.setOptions({start: regionIzq.start + 5});
            regionDere.setOptions({start: regionIzq.start + 5});
            regionIzq.setOptions({start: regionIzq.start, end: regionIzq.start + 5});
          }
          else if(separador.start >= regionDere.end){

            separador.setOptions({start: regionDere.end - 5});
            regionDere.setOptions({start: regionDere.end -5});
            regionIzq.setOptions({start: regionIzq.start, end: regionDere.end - 5});
    
          }
          else{ //Si no se hizo fuera de rango y todo esta bien
            //Marcas
            //Obtenemos la lista de marcas pertenecientes a la region de la derecha y la izquierda
            let marcasSeccIzqui = seccionIzq.marcas;
            let marcasSeccDere = seccionDere.marcas;

            //Juntamos todas las marcas en un array
            let marcasJuntas = marcasSeccIzqui.concat(marcasSeccDere);
    
            //SI HAY MARCAS
            if(marcasJuntas.length > 0){
              
              //Buscamos la primera marca que este por delante del separador, que pertenecera a la reg derecha
              let sep = marcasJuntas.findIndex(marca => marca.region.start > separador.start);
             
              if(sep != -1){ //Hay marcas en la seccion derecha
                seccionDere.marcas = marcasJuntas.splice(sep, marcasJuntas.length-sep); //desde el sep hasta el final, region derecha
                seccionIzq.marcas = marcasJuntas; //las restantes son las de la izquierda

                //Ajustamos el tiempo de fin de la ultima marca de la region derecha
                seccionDere.marcas[seccionDere.marcas.length-1].tiempo_fin = seccionDere.region.end;
              }
              else{ //No hay marcas en la seccion derecha
                seccionDere.marcas = [];
                seccionIzq.marcas = marcasJuntas;
              }
              
              if(seccionIzq.marcas.length != 0){
                //Ajustamos el tiempo de fin de la ultima marca de la region izquierda
                let ultMarcaIzqui = seccionIzq.marcas[seccionIzq.marcas.length-1];
                ultMarcaIzqui.tiempo_fin = separador.start;
    
                //Ajustamos el tiempo de fin de la marca anterior a la ultima de la reg izqui (si existe)
                if(seccionIzq.marcas.length > 1){
                  let anteUltMarcaIzqui = seccionIzq.marcas[seccionIzq.marcas.length-2];
                  anteUltMarcaIzqui.tiempo_fin = ultMarcaIzqui.region.start;
                }
              }
            }
          }
        }
      }
}