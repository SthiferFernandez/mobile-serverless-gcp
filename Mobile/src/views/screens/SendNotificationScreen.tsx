import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNotificationViewModel } from '../../viewmodels/useNotificationViewModel';
import { useTheme } from '../../context/ThemeContext';
import { Header } from '../components/Header';
import { Ionicons } from '@expo/vector-icons';

export const SendNotificationScreen = () => {
  const {
    email,
    setEmail,
    subject,
    setSubject,
    message,
    setMessage,
    loading,
    statusMessage,
    isSuccess,
    lastResult,
    sendNotification,
    resetForm,
  } = useNotificationViewModel();

  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title="Enviar Correo"
        subtitle="Flujo Desacoplado con GCP Pub/Sub y Cloud Run"
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scroll}>
          {/* Tarjeta de Información de Arquitectura */}
          <View
            style={[
              styles.infoCard,
              { backgroundColor: colors.card, borderColor: colors.cardBorder },
            ]}
          >
            <View style={styles.infoBadgeRow}>
              <View style={[styles.badge, { backgroundColor: colors.primaryLight }]}>
                <Ionicons name="git-network-outline" size={16} color={colors.primary} />
                <Text style={[styles.badgeText, { color: colors.primary }]}>
                  Arquitectura Desacoplada
                </Text>
              </View>
              <View style={[styles.badge, { backgroundColor: colors.successLight }]}>
                <Ionicons name="cloud-done-outline" size={16} color={colors.success} />
                <Text style={[styles.badgeText, { color: colors.success }]}>
                  Pub/Sub Event-Driven
                </Text>
              </View>
            </View>

            <Text style={[styles.infoDescription, { color: colors.textSecondary }]}>
              Al presionar enviar, el mensaje entra a una cola en la nube (Pub/Sub) que activa el servicio de correos para que llegue directo a tu bandeja de Gmail sin poner lenta la aplicación.
            </Text>
          </View>

          {/* Formulario Principal de Envío */}
          <View
            style={[
              styles.formCard,
              { backgroundColor: colors.card, borderColor: colors.cardBorder },
            ]}
          >
            <Text style={[styles.formTitle, { color: colors.text }]}>
              Formulario de Notificación
            </Text>

            {/* Campo: Correo Destino */}
            <Text style={[styles.label, { color: colors.textSecondary }]}>
              Correo Destino *
            </Text>
            <View
              style={[
                styles.inputWrapper,
                { backgroundColor: colors.inputBg, borderColor: colors.border },
              ]}
            >
              <Ionicons
                name="mail-outline"
                size={20}
                color={colors.textSecondary}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="ejemplo@correo.com"
                placeholderTextColor={colors.textMuted}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!loading}
              />
            </View>

            {/* Campo: Asunto */}
            <Text style={[styles.label, { color: colors.textSecondary }]}>
              Asunto del Correo *
            </Text>
            <View
              style={[
                styles.inputWrapper,
                { backgroundColor: colors.inputBg, borderColor: colors.border },
              ]}
            >
              <Ionicons
                name="bookmark-outline"
                size={20}
                color={colors.textSecondary}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Prueba PUB/SUB"
                placeholderTextColor={colors.textMuted}
                value={subject}
                onChangeText={setSubject}
                editable={!loading}
              />
            </View>

            {/* Campo: Mensaje */}
            <Text style={[styles.label, { color: colors.textSecondary }]}>
              Mensaje a Enviar *
            </Text>
            <View
              style={[
                styles.textAreaWrapper,
                { backgroundColor: colors.inputBg, borderColor: colors.border },
              ]}
            >
              <TextInput
                style={[styles.textArea, { color: colors.text }]}
                placeholder="Hola desde GCP Serverless..."
                placeholderTextColor={colors.textMuted}
                value={message}
                onChangeText={setMessage}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                editable={!loading}
              />
            </View>

            {/* Botón de Envío */}
            <TouchableOpacity
              style={[
                styles.submitBtn,
                { backgroundColor: colors.primary },
                loading && { opacity: 0.7 },
              ]}
              onPress={sendNotification}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <View style={styles.loadingRow}>
                  <ActivityIndicator size="small" color="#ffffff" />
                  <Text style={styles.submitBtnText}>Publicando en Pub/Sub...</Text>
                </View>
              ) : (
                <View style={styles.loadingRow}>
                  <Ionicons name="paper-plane-outline" size={20} color="#ffffff" />
                  <Text style={styles.submitBtnText}>Enviar Correo (Pub/Sub)</Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Banner de Estado Requerido */}
            {statusMessage ? (
              <View
                style={[
                  styles.statusBanner,
                  isSuccess
                    ? {
                        backgroundColor: colors.successLight,
                        borderColor: colors.success,
                      }
                    : {
                        backgroundColor: colors.dangerLight,
                        borderColor: colors.danger,
                      },
                ]}
              >
                <Ionicons
                  name={isSuccess ? 'checkmark-circle' : 'alert-circle'}
                  size={24}
                  color={isSuccess ? colors.success : colors.danger}
                />
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.statusTitle,
                      { color: isSuccess ? colors.success : colors.danger },
                    ]}
                  >
                    {statusMessage}
                  </Text>
                  {lastResult?.messageId && (
                    <Text
                      style={[styles.statusSub, { color: colors.textSecondary }]}
                      numberOfLines={1}
                    >
                      Pub/Sub MessageID: {lastResult.messageId}
                    </Text>
                  )}
                </View>
              </View>
            ) : null}
          </View>

          {/* Tarjeta de Diagrama de Flujo */}
          <View
            style={[
              styles.flowCard,
              { backgroundColor: colors.card, borderColor: colors.cardBorder },
            ]}
          >
            <Text style={[styles.flowTitle, { color: colors.text }]}>
              Flujo de Ejecución en GCP
            </Text>
            <View style={styles.stepRow}>
              <View style={[styles.stepNum, { backgroundColor: colors.primaryLight }]}>
                <Text style={[styles.stepNumText, { color: colors.primary }]}>1</Text>
              </View>
              <Text style={[styles.stepDesc, { color: colors.textSecondary }]}>
                <Text style={{ fontWeight: 'bold', color: colors.text }}>App Mobile:</Text>{' '}
                Envía solicitud HTTP a POST /notifications/send.
              </Text>
            </View>
            <View style={styles.stepRow}>
              <View style={[styles.stepNum, { backgroundColor: colors.primaryLight }]}>
                <Text style={[styles.stepNumText, { color: colors.primary }]}>2</Text>
              </View>
              <Text style={[styles.stepDesc, { color: colors.textSecondary }]}>
                <Text style={{ fontWeight: 'bold', color: colors.text }}>Cloud Run Backend:</Text>{' '}
                Valida campos y publica mensaje en Pub/Sub.
              </Text>
            </View>
            <View style={styles.stepRow}>
              <View style={[styles.stepNum, { backgroundColor: colors.primaryLight }]}>
                <Text style={[styles.stepNumText, { color: colors.primary }]}>3</Text>
              </View>
              <Text style={[styles.stepDesc, { color: colors.textSecondary }]}>
                <Text style={{ fontWeight: 'bold', color: colors.text }}>GCP Pub/Sub:</Text>{' '}
                Activa suscripción Push hacia notification-cloud-run.
              </Text>
            </View>
            <View style={styles.stepRow}>
              <View style={[styles.stepNum, { backgroundColor: colors.primaryLight }]}>
                <Text style={[styles.stepNumText, { color: colors.primary }]}>4</Text>
              </View>
              <Text style={[styles.stepDesc, { color: colors.textSecondary }]}>
                <Text style={{ fontWeight: 'bold', color: colors.text }}>Notification Cloud Run:</Text>{' '}
                Despacha correo por SMTP y registra evento en Logger.
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  infoCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  infoBadgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
    flexWrap: 'wrap',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  infoDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  formCard: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 10,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 46,
    fontSize: 14,
  },
  textAreaWrapper: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
  },
  textArea: {
    minHeight: 90,
    fontSize: 14,
  },
  submitBtn: {
    marginTop: 22,
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  statusBanner: {
    marginTop: 16,
    padding: 14,
    borderRadius: 8,
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusTitle: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  statusSub: {
    fontSize: 11,
    marginTop: 2,
  },
  flowCard: {
    padding: 18,
    borderRadius: 12,
    borderWidth: 1,
  },
  flowTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 14,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
  },
  stepNum: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  stepDesc: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
});
