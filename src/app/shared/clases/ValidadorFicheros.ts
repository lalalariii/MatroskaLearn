export class ValidadorFicheros{
    static async isFileValido(file: File): Promise<boolean> {
        try {
          // Intentamos leer el contenido del File
          await file.text();
          return true; // Si se puede leer, sigue válido
        } catch (error) {
            console.warn("El archivo ya no es válido en memoria:", error);
            return false; // Si hay un error, ya no está disponible
        }
      }
}