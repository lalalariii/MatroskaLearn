export class ConversorTiempo{
    // Convertir segundos a cadena de tiempo (minutos:segundos)
    static segundosATextoMinutos(segundos: number): string {
        const min = Math.floor(segundos / 60).toString().padStart(2, '0');
        const sec = Math.floor(segundos % 60).toString().padStart(2, '0');
        return `${min}:${sec}`;
    }

    // Convertir cadena de tiempo (minutos:segundos) a segundos
    static textoMinutosASegundos(texto: string): number {
        const [min, sec] = texto.split(':').map(Number);
        return min * 60 + sec;
    }
    
}