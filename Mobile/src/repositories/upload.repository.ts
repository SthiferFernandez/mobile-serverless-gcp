import { UploadService } from '../services/upload.service';
import { UploadedFileResponse, FileRecord } from '../models/file.model';

export class UploadRepository {
  async uploadFile(uri: string, filename?: string, mimeType?: string): Promise<UploadedFileResponse> {
    return await UploadService.uploadFile(uri, filename, mimeType);
  }

  async deleteFile(id: number): Promise<{ message: string; id: number }> {
    return await UploadService.deleteFile(id);
  }

  async getAllFiles(): Promise<FileRecord[]> {
    return await UploadService.getAllFiles();
  }

  /**
   * PROCESAMIENTO CONCURRENTE / PARALELO (Punto 7 y 8 de la Rúbrica)
   * Sube múltiples archivos simultáneamente utilizando Promise.all()
   */
  async uploadMultipleConcurrent(uris: string[]): Promise<{ results: UploadedFileResponse[]; durationMs: number }> {
    const startTime = Date.now();
    const uploadPromises = uris.map((uri, index) => {
      const filename = `imagen_concurrente_${index + 1}_${Date.now()}.jpg`;
      return UploadService.uploadFile(uri, filename, 'image/jpeg');
    });

    const results = await Promise.all(uploadPromises);
    const durationMs = Date.now() - startTime;
    return { results, durationMs };
  }

  /**
   * PROCESAMIENTO SECUENCIAL (Para comparación obligatoria)
   * Sube múltiples archivos uno tras otro esperando que termine el anterior
   */
  async uploadMultipleSequential(uris: string[]): Promise<{ results: UploadedFileResponse[]; durationMs: number }> {
    const startTime = Date.now();
    const results: UploadedFileResponse[] = [];

    for (let i = 0; i < uris.length; i++) {
      const filename = `imagen_secuencial_${i + 1}_${Date.now()}.jpg`;
      const res = await UploadService.uploadFile(uris[i], filename, 'image/jpeg');
      results.push(res);
    }

    const durationMs = Date.now() - startTime;
    return { results, durationMs };
  }
}
