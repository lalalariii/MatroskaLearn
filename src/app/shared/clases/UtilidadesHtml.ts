export class UtilidadesHtml{
     /**
     * Sustituye el atributo part "partAnt" de un elemento html por un nuevo part, "partNuevo"
     * @param elemento elemento html en el cual se va a sustituir un part por otro
     * @param partAnt part antiguo
     * @param partNuevo part nuevo
     */
    static sustituirPartAElementoHTML(elemento: HTMLElement, partAnt: string, partNuevo: string){
        
        const currentParts = elemento.getAttribute('part') || '';
        const updatedParts = currentParts
        .split(' ') // Dividir por espacios
        .filter(part => part !== partAnt) // Filtrar la palabra que deseas eliminar
        .join(' '); // Volver a unir las palabras restantes

        elemento.setAttribute('part', updatedParts+" "+ partNuevo);
    }
}