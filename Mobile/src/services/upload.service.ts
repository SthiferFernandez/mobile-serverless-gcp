import { apiService } from './api.service';
import { UploadedFileResponse, FileRecord } from '../models/file.model';

export class UploadService {
  /**
   * Sube un archivo usando FormData multipart/form-data
   * @param uri URI del archivo local en el dispositivo
   * @param filename Nombre del archivo
   * @param mimeType Tipo MIME (e.g. 'image/jpeg')
   */
  static async uploadFile(uri: string, filename?: string, mimeType?: string): Promise<UploadedFileResponse> {
    const finalName = filename || uri.split('/').pop() || 'photo.jpg';
    const finalType = mimeType || 'image/jpeg';

    const formData = new FormData();
    formData.append('file', {
      uri,
      name: finalName,
      type: finalType,
    } as any);

    return await apiService.post<UploadedFileResponse>('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  static async deleteFile(id: number): Promise<{ message: string; id: number }> {
    return await apiService.delete<{ message: string; id: number }>(`/upload/${id}`);
  }

  static async getAllFiles(): Promise<FileRecord[]> {
    return await apiService.get<FileRecord[]>('/files');
  }
}
