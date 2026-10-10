import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { useUploadViewModel } from '../../viewmodels/useUploadViewModel';
import { useTheme } from '../../context/ThemeContext';
import { Header } from '../components/Header';
import { Ionicons } from '@expo/vector-icons';
import { apiService } from '../../services/api.service';
import { FileRecord } from '../../models/file.model';

export const UploadScreen = () => {
  const {
    files,
    selectedImages,
    loading,
    uploading,
    lastBatchTimeMs,
    lastBatchMode,
    pickSingleImage,
    pickMultipleImages,
    uploadSingle,
    uploadBatchConcurrent,
    uploadBatchSequential,
    deleteFile,
    refreshFiles,
  } = useUploadViewModel();

  const { colors } = useTheme();

  const handleUploadSingle = async () => {
    const uri = await pickSingleImage();
    if (!uri) return;

    const res = await uploadSingle(uri);
    if (res) {
      Alert.alert(
        'Archivo Subido',
        `ID: ${res.id}\nNombre: ${res.filename}\nRuta: ${res.url}`
      );
    }
  };

  const handlePickBatch = async () => {
    await pickMultipleImages();
  };

  const handleRunBatchConcurrent = async () => {
    if (selectedImages.length === 0) {
      Alert.alert('Atención', 'Selecciona primero las imágenes');
      return;
    }
    await uploadBatchConcurrent(selectedImages);
  };

  const handleRunBatchSequential = async () => {
    if (selectedImages.length === 0) {
      Alert.alert('Atención', 'Selecciona primero las imágenes');
      return;
    }
    await uploadBatchSequential(selectedImages);
  };

  const confirmDelete = (file: FileRecord) => {
    Alert.alert('Eliminar Archivo', `¿Deseas eliminar '${file.filename}'?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          await deleteFile(file.id);
        },
      },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Archivos" subtitle="Subida Multipart y Concurrencia" />

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refreshFiles} tintColor={colors.primary} />
        }
      >
        {/* PANEL DE SUBIDA */}
        <View
          style={[
            styles.uploadCard,
            { backgroundColor: colors.card, borderColor: colors.cardBorder },
          ]}
        >
          <Text style={[styles.cardTitle, { color: colors.text }]}>
            Módulo de Subida (POST /upload)
          </Text>
          <Text style={[styles.cardDesc, { color: colors.textSecondary }]}>
            Envío de archivos multipart/form-data validados y persistidos en base de datos.
          </Text>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.btn, { backgroundColor: colors.primary }]}
              onPress={handleUploadSingle}
              disabled={uploading}
            >
              <Ionicons name="cloud-upload-outline" size={18} color="#ffffff" />
              <Text style={styles.btnText}>Subir 1 Archivo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.btn,
                { backgroundColor: colors.primaryLight, borderColor: colors.cardBorder, borderWidth: 1 },
              ]}
              onPress={handlePickBatch}
              disabled={uploading}
            >
              <Ionicons name="images-outline" size={18} color={colors.accent} />
              <Text style={[styles.btnTextPicker, { color: colors.accent }]}>
                Elegir Lote (Hasta 5)
              </Text>
            </TouchableOpacity>
          </View>

          {/* LOTE SELECCIONADO */}
          {selectedImages.length > 0 && (
            <View
              style={[
                styles.batchContainer,
                { backgroundColor: colors.inputBg, borderColor: colors.cardBorder },
              ]}
            >
              <Text style={[styles.batchTitle, { color: colors.text }]}>
                {selectedImages.length} imágenes seleccionadas para prueba concurrente:
              </Text>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.previewRow}>
                {selectedImages.map((uri, idx) => (
                  <Image key={idx} source={{ uri }} style={styles.thumbPreview} />
                ))}
              </ScrollView>

              <View style={styles.batchActions}>
                <TouchableOpacity
                  style={[styles.batchBtn, { backgroundColor: colors.success }]}
                  onPress={handleRunBatchConcurrent}
                  disabled={uploading}
                >
                  <Ionicons name="flash" size={16} color="#ffffff" />
                  <Text style={styles.batchBtnText}>Subida Concurrente (Promise.all)</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.batchBtn, { backgroundColor: colors.warning }]}
                  onPress={handleRunBatchSequential}
                  disabled={uploading}
                >
                  <Ionicons name="timer-outline" size={16} color="#ffffff" />
                  <Text style={styles.batchBtnText}>Subida Secuencial</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {uploading && (
            <View style={styles.uploadingBox}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={[styles.uploadingText, { color: colors.accent }]}>
                Subiendo archivo(s) al servidor Fiber...
              </Text>
            </View>
          )}

          {lastBatchTimeMs !== null && (
            <View
              style={[
                styles.metricBox,
                { backgroundColor: colors.successLight, borderColor: colors.success },
              ]}
            >
              <Text style={[styles.metricTitle, { color: colors.success }]}>
                Resultado del último lote ({lastBatchMode}):
              </Text>
              <Text style={[styles.metricVal, { color: colors.success }]}>
                ⏱️ {lastBatchTimeMs} ms
              </Text>
            </View>
          )}
        </View>

        {/* LISTADO DE ARCHIVOS EN SERVIDOR */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Archivos en el Servidor ({files.length})
        </Text>

        {files.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="folder-open-outline" size={40} color={colors.textMuted} />
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              No hay archivos subidos aún
            </Text>
          </View>
        ) : (
          files.map((file) => {
            const fullUrl = `${apiService.getBaseUrl()}${file.url}`;
            const isImage =
              file.mimeType?.startsWith('image') ||
              file.filename.match(/\.(jpg|jpeg|png|webp|gif)$/i);

            return (
              <View
                key={file.id}
                style={[
                  styles.fileItem,
                  { backgroundColor: colors.card, borderColor: colors.cardBorder },
                ]}
              >
                {isImage ? (
                  <Image source={{ uri: fullUrl }} style={styles.fileThumb} />
                ) : (
                  <View
                    style={[
                      styles.fileThumb,
                      styles.fileIconPlaceholder,
                      { backgroundColor: colors.inputBg },
                    ]}
                  >
                    <Ionicons name="document-text-outline" size={24} color={colors.accent} />
                  </View>
                )}

                <View style={styles.fileInfo}>
                  <Text style={[styles.fileName, { color: colors.text }]} numberOfLines={1}>
                    {file.filename}
                  </Text>
                  <Text style={[styles.fileMeta, { color: colors.textSecondary }]}>
                    ID: #{file.id} • {file.size ? `${(file.size / 1024).toFixed(1)} KB` : 'N/A'}
                  </Text>
                  <Text style={[styles.fileDate, { color: colors.textMuted }]}>
                    {new Date(file.createdAt).toLocaleDateString()}
                  </Text>
                </View>

                <TouchableOpacity
                  style={[styles.deleteFileBtn, { backgroundColor: colors.dangerLight }]}
                  onPress={() => confirmDelete(file)}
                >
                  <Ionicons name="trash-outline" size={18} color={colors.danger} />
                </TouchableOpacity>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    padding: 16,
    paddingBottom: 40,
  },
  uploadCard: {
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  cardDesc: {
    fontSize: 12,
    marginTop: 4,
    marginBottom: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  btn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 10,
  },
  btnText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 13,
  },
  btnTextPicker: {
    fontWeight: 'bold',
    fontSize: 13,
  },
  batchContainer: {
    marginTop: 16,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  batchTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  previewRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  thumbPreview: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 8,
  },
  batchActions: {
    gap: 8,
  },
  batchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
  },
  batchBtnText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 12,
  },
  uploadingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 14,
  },
  uploadingText: {
    fontSize: 12,
    fontWeight: '500',
  },
  metricBox: {
    marginTop: 14,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricTitle: {
    fontSize: 12,
  },
  metricVal: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  fileItem: {
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
  },
  fileThumb: {
    width: 48,
    height: 48,
    borderRadius: 8,
  },
  fileIconPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  fileInfo: {
    flex: 1,
    marginLeft: 12,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '600',
  },
  fileMeta: {
    fontSize: 12,
    marginTop: 2,
  },
  fileDate: {
    fontSize: 11,
    marginTop: 2,
  },
  deleteFileBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 8,
  },
  emptyText: {
    fontSize: 13,
  },
});
