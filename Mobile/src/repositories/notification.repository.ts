import { apiService } from '../services/api.service';
import { SendNotificationPayload, SendNotificationResponse } from '../models/notification.model';

export class NotificationRepository {
  async sendNotification(payload: SendNotificationPayload): Promise<SendNotificationResponse> {
    return await apiService.post<SendNotificationResponse>('/notifications/send', payload);
  }
}

export const notificationRepository = new NotificationRepository();
