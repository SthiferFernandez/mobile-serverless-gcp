import { useState } from 'react';
import { Alert } from 'react-native';
import { notificationRepository } from '../repositories/notification.repository';
import { SendNotificationResponse } from '../models/notification.model';

export const useNotificationViewModel = () => {
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean | null>(null);
  const [lastResult, setLastResult] = useState<SendNotificationResponse | null>(null);

  const resetForm = () => {
    setEmail('');
    setSubject('');
    setMessage('');
    setStatusMessage(null);
    setIsSuccess(null);
  };

  const sendNotification = async (): Promise<boolean> => {
    const trimmedEmail = email.trim();
    const trimmedSubject = subject.trim();
    const trimmedMessage = message.trim();

    if (!trimmedEmail || !trimmedSubject || !trimmedMessage) {
      const errMsg = 'Error al enviar mensaje.';
      setStatusMessage(errMsg);
      setIsSuccess(false);
      Alert.alert('Atención', 'Por favor completa todos los campos: Correo destino, Asunto y Mensaje.');
      return false;
    }

    try {
      setLoading(true);
      setStatusMessage(null);
      setIsSuccess(null);

      const response = await notificationRepository.sendNotification({
        email: trimmedEmail,
        subject: trimmedSubject,
        message: trimmedMessage,
      });

      setLastResult(response);
      const successText = 'Mensaje enviado correctamente.';
      setStatusMessage(successText);
      setIsSuccess(true);

      Alert.alert(
        '¡Notificación Enviada!',
        `${successText}\n\nEl mensaje ha sido publicado en el Topic de Pub/Sub y enrutado a notification-cloud-run.`
      );

      // Limpiar campos de asunto y mensaje
      setSubject('');
      setMessage('');
      return true;
    } catch (err: any) {
      console.error('[NotificationViewModel] Error al enviar notificación vía Pub/Sub:', err);
      const errorText = 'Error al enviar mensaje.';
      setStatusMessage(errorText);
      setIsSuccess(false);

      const detail = err.response?.data?.message || err.message || 'Verifica la conexión con el Backend en GCP';
      Alert.alert('Error', `${errorText}\n\n${detail}`);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
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
  };
};
