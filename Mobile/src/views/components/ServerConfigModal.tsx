import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export const ServerConfigModal: React.FC<Props> = ({ visible, onClose }) => {
  const { serverUrl, updateServerUrl, autoDetectServer } = useAuth();
  const { colors } = useTheme();
  const [url, setUrl] = useState(serverUrl);
  const [detecting, setDetecting] = useState(false);

  useEffect(() => {
    setUrl(serverUrl);
  }, [serverUrl, visible]);

  const handleSave = async () => {
    if (!url.trim()) {
      Alert.alert('Error', 'La URL del servidor no puede estar vacía');
      return;
    }
    await updateServerUrl(url);
    Alert.alert('Éxito', `Servidor actualizado a:\n${url}`);
    onClose();
  };

  const handleAutoDetect = async () => {
    try {
      setDetecting(true);
      const found = await autoDetectServer();
      setUrl(found);
      Alert.alert('Conexión Exitosa', `Servidor Go Fiber encontrado en:\n${found}`);
    } catch {
      Alert.alert('Aviso', 'No se detectó el backend automáticamente. Elige un acceso rápido.');
    } finally {
      setDetecting(false);
    }
  };

  const setPreset = (presetUrl: string) => {
    setUrl(presetUrl);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View
          style={[
            styles.container,
            { backgroundColor: colors.surface, borderColor: colors.cardBorder, borderWidth: 1 },
          ]}
        >
          <View style={styles.header}>
            <Ionicons name="server-outline" size={24} color={colors.primary} />
            <Text style={[styles.title, { color: colors.text }]}>Configurar Servidor Backend</Text>
          </View>

          <Text style={[styles.label, { color: colors.textSecondary }]}>
            URL Base de la API Go Fiber:
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.inputBg,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
            value={url}
            onChangeText={setUrl}
            placeholder="http://10.0.2.2:8080"
            placeholderTextColor={colors.textMuted}
            autoCapitalize="none"
            autoCorrect={false}
          />

          {/* Botón de Auto-Detección Inteligente */}
          <TouchableOpacity
            style={[
              styles.autoDetectBtn,
              { backgroundColor: colors.primaryLight, borderColor: colors.cardBorder },
            ]}
            onPress={handleAutoDetect}
            disabled={detecting}
          >
            {detecting ? (
              <ActivityIndicator size="small" color={colors.accent} />
            ) : (
              <>
                <Ionicons name="radio-outline" size={18} color={colors.accent} />
                <Text style={[styles.autoDetectText, { color: colors.accent }]}>
                  Detectar y Conectar Automáticamente
                </Text>
              </>
            )}
          </TouchableOpacity>

          <Text style={[styles.presetsLabel, { color: colors.textSecondary }]}>
            Accesos Rápidos Recomendados:
          </Text>
          <View style={styles.presetsContainer}>
            {/* ACCESO RÁPIDO PARA GOOGLE CLOUD RUN */}
            <TouchableOpacity
              style={[
                styles.presetButton,
                styles.presetFeatured,
                {
                  backgroundColor: colors.primaryLight,
                  borderColor: '#4285F4',
                },
              ]}
              onPress={() => setPreset('https://mobile-backend-api-414714685541.us-central1.run.app')}
            >
              <View style={styles.presetRow}>
                <Ionicons name="cloud-done-outline" size={18} color="#4285F4" />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.presetTitle, { color: colors.text }]}>
                    Google Cloud Run (Producción Serverless)
                  </Text>
                  <Text style={[styles.presetSub, { color: '#4285F4' }]} numberOfLines={1}>
                    https://mobile-backend-api-414714685541.us-central1.run.app
                  </Text>
                </View>
              </View>
            </TouchableOpacity>

            {/* ACCESO RÁPIDO PARA EMULADOR PIXEL_7 */}
            <TouchableOpacity
              style={[
                styles.presetButton,
                {
                  backgroundColor: colors.inputBg,
                  borderColor: colors.border,
                },
              ]}
              onPress={() => setPreset('http://10.0.2.2:8080')}
            >
              <View style={styles.presetRow}>
                <Ionicons name="phone-portrait-outline" size={18} color={colors.accent} />
                <View>
                  <Text style={[styles.presetTitle, { color: colors.text }]}>
                    Emulador Android Pixel 7 (Local)
                  </Text>
                  <Text style={[styles.presetSub, { color: colors.accent }]}>
                    http://10.0.2.2:8080
                  </Text>
                </View>
              </View>
            </TouchableOpacity>

            {/* ACCESO RÁPIDO PARA WI-FI ACTUAL (192.168.60.88) */}
            <TouchableOpacity
              style={[
                styles.presetButton,
                { backgroundColor: colors.inputBg, borderColor: colors.border },
              ]}
              onPress={() => setPreset('http://192.168.60.88:8080')}
            >
              <View style={styles.presetRow}>
                <Ionicons name="wifi-outline" size={18} color={colors.textSecondary} />
                <View>
                  <Text style={[styles.presetTitle, { color: colors.text }]}>
                    Wi-Fi Actual de tu PC (Para Teléfono Físico)
                  </Text>
                  <Text style={[styles.presetSub, { color: colors.textSecondary }]}>
                    http://192.168.60.88:8080
                  </Text>
                </View>
              </View>
            </TouchableOpacity>

            {/* LOCALHOST */}
            <TouchableOpacity
              style={[
                styles.presetButton,
                { backgroundColor: colors.inputBg, borderColor: colors.border },
              ]}
              onPress={() => setPreset('http://localhost:8080')}
            >
              <View style={styles.presetRow}>
                <Ionicons name="laptop-outline" size={18} color={colors.textSecondary} />
                <View>
                  <Text style={[styles.presetTitle, { color: colors.text }]}>
                    Localhost
                  </Text>
                  <Text style={[styles.presetSub, { color: colors.textSecondary }]}>
                    http://localhost:8080
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.cancelBtn, { backgroundColor: colors.cardBorder }]}
              onPress={onClose}
            >
              <Text style={[styles.cancelText, { color: colors.text }]}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: colors.primary }]}
              onPress={handleSave}
            >
              <Text style={styles.saveText}>Guardar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 420,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  label: {
    fontSize: 13,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    marginBottom: 10,
  },
  autoDetectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 14,
  },
  autoDetectText: {
    fontSize: 13,
    fontWeight: '600',
  },
  presetsLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  presetsContainer: {
    gap: 8,
    marginBottom: 18,
  },
  presetButton: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  presetFeatured: {
    borderWidth: 1.5,
  },
  presetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  presetTitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  presetSub: {
    fontSize: 11,
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  cancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  cancelText: {
    fontWeight: '600',
  },
  saveBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  saveText: {
    color: '#ffffff',
    fontWeight: '600',
  },
});
