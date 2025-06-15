import { Injectable } from '@angular/core';
import { openDB, IDBPDatabase } from 'idb';

const DB_NAME = 'FileStorageDB';
const STORE_NAME = 'files';

@Injectable({
  providedIn: 'root'
})
export class IndexedDbService {
  private dbPromise: Promise<IDBPDatabase>;

  constructor() {
    this.dbPromise = this.initDB();
  }

  // Inicializa la base de datos
  private async initDB() {
    return openDB(DB_NAME, 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      }
    });
  }

  // Guarda un archivo en IndexedDB y devuelve su clave de acceso
  async cacheFile(file: File): Promise<string> {
    const db = await this.dbPromise;
    const fileId = `${Date.now()}-${file.name}`;

    await db.put(STORE_NAME, file, fileId);
    console.log(`Archivo guardado en IndexedDB: ${fileId}`);

    return fileId; // Devuelve la clave para acceder al archivo
  }

  // Recupera un archivo de IndexedDB a partir de su clave
  async getCachedFile(fileId: string): Promise<File | null> {
    const db = await this.dbPromise;
    const file = await db.get(STORE_NAME, fileId);

    return file ? file : null;
  }

  // Elimina un archivo de IndexedDB
  async deleteCachedFile(fileId: string): Promise<void> {
    const db = await this.dbPromise;
    await db.delete(STORE_NAME, fileId);
    console.log(`Archivo eliminado de IndexedDB: ${fileId}`);
  }

  // Borra todos los archivos guardados
  async clearCache(): Promise<void> {
    const db = await this.dbPromise;
    await db.clear(STORE_NAME);
    console.log('Todos los archivos han sido eliminados de IndexedDB.');
  }
  
}
