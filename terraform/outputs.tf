output "cloud_run_url" {
  description = "URL publica asignada a Cloud Run"
  value       = google_cloud_run_v2_service.backend.uri
}

output "api_gateway_url" {
  description = "URL publica asignada al API Gateway"
  value       = "https://${google_api_gateway_gateway.mobile_gw.default_hostname}"
}

output "artifact_registry_repo" {
  description = "URI del repositorio en Artifact Registry"
  value       = "${var.region}-docker.pkg.dev/${var.project_id}/${var.repository_id}"
}

output "cloud_sql_ip" {
  description = "Dirección IP pública de Cloud SQL PostgreSQL"
  value       = length(google_sql_database_instance.postgres) > 0 ? google_sql_database_instance.postgres[0].public_ip_address : "N/A"
}

output "cloud_sql_connection_name" {
  description = "Nombre de conexión de la instancia de Cloud SQL"
  value       = length(google_sql_database_instance.postgres) > 0 ? google_sql_database_instance.postgres[0].connection_name : "N/A"
}

output "storage_bucket_name" {
  description = "Nombre del bucket de Google Cloud Storage"
  value       = google_storage_bucket.uploads_bucket.name
}

output "cloudrun_service_account" {
  description = "Cuenta de servicio de Cloud Run"
  value       = google_service_account.cloudrun_sa.email
}

output "apigateway_service_account" {
  description = "Cuenta de servicio de API Gateway"
  value       = google_service_account.gateway_sa.email
}

output "pubsub_topic_id" {
  description = "ID del Topic de Pub/Sub para notificaciones"
  value       = google_pubsub_topic.notification_topic.id
}

output "pubsub_subscription_id" {
  description = "ID de la Suscripción Push de Pub/Sub"
  value       = google_pubsub_subscription.notification_sub.id
}

output "notification_cloud_run_url" {
  description = "URL asignada a la Cloud Run de Notificaciones"
  value       = google_cloud_run_v2_service.notification_service.uri
}

