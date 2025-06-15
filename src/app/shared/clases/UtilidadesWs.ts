import WaveSurfer from "wavesurfer.js";
import { Region } from "wavesurfer.js/dist/plugins/regions.js";

export class UtilidadesWs{
    /**
     * Situa la region en el centro (horizontalmente) de la seccion visible del wavesurfer
     * @param region Region a centrar
     * @param zoom Zoom actual
     */
    static centrarRegionHorizontalmente(wsWidth:any, wsScroll:any ,region:Region, zoom: number){
        //Calculamos el centro de la ventana y situamos la region en el medio
        const centerTime = (wsScroll + wsWidth / 2) / zoom;
        region.setOptions({start: centerTime});
    }

    /**
     * Centra el scroll horizontal del wavesurfer (cuando hay zoom), de modo que el cursor quede en el centro
     * @param zoom zoom actual
     */
    static centrarScrollEnTiempo(waveSurfer: WaveSurfer, cursor: Region, zoom: number){
        if(zoom != 0){
        //Obtenemos la duracion visible en segundos
        const duracionVisible = waveSurfer.getWidth() / zoom; 

        //Calculamos el tiempo de scroll para centrar el cursor
        const tiempoScroll = cursor.start - duracionVisible / 2;

        //Comprobamos que el tiempo no sea negativo ni exceda la duracion total
        const tiempoScrollCorregido = Math.max(0, Math.min(tiempoScroll, waveSurfer.getDuration() - duracionVisible));
        
        //Desplazamos el scroll para que el cursor quede en el medio
        waveSurfer.setScrollTime(tiempoScrollCorregido);
        }    
    }
    

}