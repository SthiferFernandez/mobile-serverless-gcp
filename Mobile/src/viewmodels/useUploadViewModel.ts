import { useState, useCallback, useEffect } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { UploadRepository } from '../repositories/upload.repository';
import { UploadedFileResponse, FileRecord } from '../models/file.model';

const uploadRepo = new UploadRepository();

export function useUploadViewModel() {
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [uploading, setUploading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastBatchTimeMs, setLastBatchTimeMs] = useState<number | null>(null);
  const [lastBatchMode, setLastBatchMode] = useState<'concurrent' | 'sequential' | null>(null);

  const loadFiles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await uploadRepo.getAllFiles();
      setFiles(data);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Error al cargar lista de archivos';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  const pickSingleImage = async (): Promise<string | null> => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setError('Permiso de galería denegado');
      return null;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      return result.assets[0].uri;
    }
    return null;
  };

  const pickMultipleImages = async (): Promise<string[]> => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setError('Permiso de galería denegado');
      return [];
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: 5,
      quality: 0.7,
    });

    if (!result.canceled && result.assets) {
      const uris = result.assets.map((a) => a.uri);
      setSelectedImages(uris);
      return uris;
    }
    return [];
  };

  const uploadSingle = async (uri: string): Promise<UploadedFileResponse | null> => {
    try {
      setUploading(true);
      setError(null);
      const res = await uploadRepo.uploadFile(uri);
      await loadFiles();
      return res;
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Error al subir archivo';
      setError(msg);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const uploadBatchConcurrent = async (uris: string[]): Promise<boolean> => {
    try {
      setUploading(true);
      setError(null);
      setLastBatchMode('concurrent');
      const { durationMs } = await uploadRepo.uploadMultipleConcurrent(uris);
      setLastBatchTimeMs(durationMs);
      setSelectedImages([]);
      await loadFiles();
      return true;
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Error en subida concurrente';
      setError(msg);
      return false;
    } finally {
      setUploading(false);
    }
  };

  const uploadBatchSequential = async (uris: string[]): Promise<boolean> => {
    try {
      setUploading(true);
      setError(null);
      setLastBatchMode('sequential');
      const { durationMs } = await uploadRepo.uploadMultipleSequential(uris);
      setLastBatchTimeMs(durationMs);
      setSelectedImages([]);
      await loadFiles();
      return true;
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Error en subida secuencial';
      setError(msg);
      return false;
    } finally {
      setUploading(false);
    }
  };

  const deleteFile = async (id: number): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await uploadRepo.deleteFile(id);
      setFiles((prev) => prev.filter((f) => f.id !== id));
      return true;
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Error al eliminar archivo';
      setError(msg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    files,
    selectedImages,
    loading,
    uploading,
    error,
    lastBatchTimeMs,
    lastBatchMode,
    setSelectedImages,
    pickSingleImage,
    pickMultipleImages,
    uploadSingle,
    uploadBatchConcurrent,
    uploadBatchSequential,
    deleteFile,
    refreshFiles: loadFiles,
    clearError: () => setError(null),
  };
}
