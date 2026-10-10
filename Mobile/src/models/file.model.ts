export interface UploadedFileResponse {
  id: number;
  filename: string;
  url: string;
  size?: number;
  mimeType?: string;
}

export interface FileRecord {
  id: number;
  filename: string;
  url: string;
  size: number;
  mimeType: string;
  userId: number;
  createdAt: string;
}
