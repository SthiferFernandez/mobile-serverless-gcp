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
