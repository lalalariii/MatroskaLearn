export class Color{

    /**
     * Devuelve un color en rgba generado aleatoriamente
     * @returns color en rgba generado aleatoriamente
     */
    static generarColorAleatorio(): string{
        const random = (min: number, max: number) => Math.random() * (max - min) + min
        return `rgba(${random(0, 255)}, ${random(0, 255)}, ${random(0, 255)}, 0.5)`
    }

    /**
     * Convierte un color hexadecimal a formato RGBA agregando una transparencia de trans
     * @param hex codigo hexadecimal del color
     * @param trans Grado de transparencia a aplicar al color (de 0 a 1) 
     * @returns color en rgba resultante de convertir el hexadecimal aplicando el grado de transparencia
     */
    static hexToRgba(hex: string, trans: number): string {
        const match = hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
        if (!match) {
        throw new Error('Formato de color no válido');
        }
        const r = parseInt(match[1], 16);
        const g = parseInt(match[2], 16);
        const b = parseInt(match[3], 16);
        return `rgba(${r}, ${g}, ${b}, ${trans})`; 
    }
}