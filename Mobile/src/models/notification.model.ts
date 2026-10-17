export interface SendNotificationPayload {
  email: string;
  subject: string;
  message: string;
}

export interface SendNotificationResponse {
  status: string;
  message: string;
  messageId?: string;
  topic?: string;
}
