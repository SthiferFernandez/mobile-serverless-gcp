variable "project_id" {
  description = "Google Cloud Project ID"
  type        = string
  default     = "semana-3-sthifer"
}

variable "region" {
  description = "Google Cloud Region para los recursos"
  type        = string
  default     = "us-central1"
}

variable "service_name" {
  description = "Nombre del servicio Cloud Run"
  type        = string
  default     = "mobile-backend-api"
}

variable "repository_id" {
  description = "ID del repositorio de Artifact Registry para Docker"
  type        = string
  default     = "mobile-repo"
}

variable "image_tag" {
  description = "Tag de la imagen de Docker a desplegar"
  type        = string
  default     = "latest"
}

variable "jwt_secret" {
  description = "Clave secreta para generación y validación de tokens JWT"
  type        = string
  default     = "super_secret_jwt_key_utesa_2026"
  sensitive   = true
}

variable "db_name" {
  description = "Nombre de la base de datos PostgreSQL"
  type        = string
  default     = "mobile_db"
}

variable "db_user" {
  description = "Usuario administrador de PostgreSQL"
  type        = string
  default     = "postgres"
}

variable "db_password" {
  description = "Contraseña del usuario de PostgreSQL"
  type        = string
  default     = "MobilePostgres2026#"
  sensitive   = true
}

variable "enable_cloud_sql" {
  description = "Habilitar creación de instancia Cloud SQL PostgreSQL (db-f1-micro)"
  type        = bool
  default     = true
}

variable "database_url" {
  description = "URL de conexión directa a PostgreSQL (ej. Cloud SQL o Neon/Supabase)"
  type        = string
  default     = ""
  sensitive   = true
}

# Variables para Pub/Sub y Notification Cloud Run
variable "notification_service_name" {
  description = "Nombre de la nueva función Cloud Run de Notificaciones"
  type        = string
  default     = "notification-cloud-run"
}

variable "notification_topic_name" {
  description = "Nombre del Topic de Pub/Sub para notificaciones"
  type        = string
  default     = "notification-topic"
}

variable "notification_sub_name" {
  description = "Nombre de la suscripción Push de Pub/Sub hacia Cloud Run"
  type        = string
  default     = "notification-sub"
}

variable "notification_image_name" {
  description = "Nombre de la imagen Docker para el servicio de notificaciones"
  type        = string
  default     = "notification-service"
}

variable "smtp_host" {
  description = "Servidor SMTP para envío de correos reales (opcional)"
  type        = string
  default     = ""
}

variable "smtp_port" {
  description = "Puerto del servidor SMTP"
  type        = string
  default     = "587"
}

variable "smtp_user" {
  description = "Usuario SMTP"
  type        = string
  default     = ""
}

variable "smtp_pass" {
  description = "Contraseña SMTP"
  type        = string
  default     = ""
  sensitive   = true
}

variable "smtp_from" {
  description = "Dirección de correo remitente"
  type        = string
  default     = "notificaciones@utesa-mobile.edu.do"
}

