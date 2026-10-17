# ==============================================================================
# HABILITAR APIS DE GOOGLE CLOUD
# ==============================================================================
locals {
  services = [
    "run.googleapis.com",
    "apigateway.googleapis.com",
    "servicemanagement.googleapis.com",
    "servicecontrol.googleapis.com",
    "artifactregistry.googleapis.com",
    "sqladmin.googleapis.com",
    "secretmanager.googleapis.com",
    "cloudbuild.googleapis.com",
    "logging.googleapis.com",
    "storage.googleapis.com",
    "pubsub.googleapis.com"
  ]
}

resource "google_project_service" "enabled_apis" {
  for_each                   = toset(local.services)
  project                    = var.project_id
  service                    = each.key
  disable_dependent_services = false
  disable_on_destroy         = false
}

# ==============================================================================
# ARTIFACT REGISTRY (DOCKER)
# ==============================================================================
resource "google_artifact_registry_repository" "mobile_repo" {
  location      = var.region
  repository_id = var.repository_id
  description   = "Repositorio Docker para imagenes del Backend Go Fiber"
  format        = "DOCKER"

  depends_on = [google_project_service.enabled_apis]
}

# ==============================================================================
# SERVICE ACCOUNTS & IAM ROLES
# ==============================================================================
# Service Account para Cloud Run
resource "google_service_account" "cloudrun_sa" {
  account_id   = "cloudrun-mobile-sa"
  display_name = "Cloud Run Mobile Backend Service Account"
  depends_on   = [google_project_service.enabled_apis]
}

# Service Account para API Gateway
resource "google_service_account" "gateway_sa" {
  account_id   = "apigateway-mobile-sa"
  display_name = "API Gateway Mobile Service Account"
  depends_on   = [google_project_service.enabled_apis]
}

# Roles para Cloud Run Service Account
resource "google_project_iam_member" "cloudrun_secret_accessor" {
  project = var.project_id
  role    = "roles/secretmanager.secretAccessor"
  member  = "serviceAccount:${google_service_account.cloudrun_sa.email}"
}

resource "google_project_iam_member" "cloudrun_sql_client" {
  project = var.project_id
  role    = "roles/cloudsql.client"
  member  = "serviceAccount:${google_service_account.cloudrun_sa.email}"
}

resource "google_project_iam_member" "cloudrun_log_writer" {
  project = var.project_id
  role    = "roles/logging.logWriter"
  member  = "serviceAccount:${google_service_account.cloudrun_sa.email}"
}

resource "google_project_iam_member" "cloudrun_storage_viewer" {
  project = var.project_id
  role    = "roles/storage.objectViewer"
  member  = "serviceAccount:${google_service_account.cloudrun_sa.email}"
}

# Permiso para que API Gateway invoque Cloud Run
resource "google_project_iam_member" "gateway_invoker" {
  project = var.project_id
  role    = "roles/run.invoker"
  member  = "serviceAccount:${google_service_account.gateway_sa.email}"
}

# ==============================================================================
# CLOUD SQL POSTGRESQL (OPCIONAL/CONFIGURABLE)
# ==============================================================================
resource "random_id" "db_suffix" {
  byte_length = 3
}

resource "google_sql_database_instance" "postgres" {
  count            = var.enable_cloud_sql ? 1 : 0
  name             = "mobile-postgres-${random_id.db_suffix.hex}"
  database_version = "POSTGRES_15"
  region           = var.region

  settings {
    tier              = "db-f1-micro"
    availability_type = "ZONAL"
    disk_size         = 10
    disk_type         = "PD_SSD"

    ip_configuration {
      ipv4_enabled = true
      authorized_networks {
        name  = "all-authorized"
        value = "0.0.0.0/0"
      }
    }
  }

  deletion_protection = false

  depends_on = [google_project_service.enabled_apis]
}

resource "google_sql_database" "db" {
  count    = var.enable_cloud_sql ? 1 : 0
  name     = var.db_name
  instance = google_sql_database_instance.postgres[0].name
}

resource "google_sql_user" "user" {
  count    = var.enable_cloud_sql ? 1 : 0
  name     = var.db_user
  instance = google_sql_database_instance.postgres[0].name
  password = var.db_password
}

locals {
  computed_db_url = (var.database_url != "" && var.database_url != "sqlite") ? var.database_url : (
    var.enable_cloud_sql ? "host=${google_sql_database_instance.postgres[0].public_ip_address} user=${var.db_user} password=${var.db_password} dbname=${var.db_name} port=5432 sslmode=disable" : ""
  )
}

# ==============================================================================
# SECRET MANAGER
# ==============================================================================
resource "google_secret_manager_secret" "jwt_secret" {
  secret_id = "jwt-secret"
  replication {
    auto {}
  }
  depends_on = [google_project_service.enabled_apis]
}

resource "google_secret_manager_secret_version" "jwt_secret_ver" {
  secret      = google_secret_manager_secret.jwt_secret.id
  secret_data = var.jwt_secret
}

resource "google_secret_manager_secret" "db_url" {
  secret_id = "database-url"
  replication {
    auto {}
  }
  depends_on = [google_project_service.enabled_apis]
}

resource "google_secret_manager_secret_version" "db_url_ver" {
  secret      = google_secret_manager_secret.db_url.id
  secret_data = local.computed_db_url != "" ? local.computed_db_url : "sqlite"
}

# ==============================================================================
# CLOUD STORAGE BUCKET (ARCHIVOS Y FOTOS)
# ==============================================================================
resource "google_storage_bucket" "uploads_bucket" {
  name                        = "${var.project_id}-uploads-bucket"
  location                    = var.region
  force_destroy               = true
  uniform_bucket_level_access = true

  cors {
    origin          = ["*"]
    method          = ["GET", "POST", "PUT", "DELETE", "HEAD"]
    response_header = ["*"]
    max_age_seconds = 3600
  }

  depends_on = [google_project_service.enabled_apis]
}

# ==============================================================================
# CLOUD RUN (GO FIBER BACKEND)
# ==============================================================================
resource "google_cloud_run_v2_service" "backend" {
  name     = var.service_name
  location = var.region
  ingress  = "INGRESS_TRAFFIC_ALL"

  template {
    service_account = google_service_account.cloudrun_sa.email

    containers {
      image = "${var.region}-docker.pkg.dev/${var.project_id}/${var.repository_id}/backend-api:${var.image_tag}"

      ports {
        container_port = 8080
      }

      resources {
        limits = {
          cpu    = "1000m"
          memory = "512Mi"
        }
      }

      env {
        name  = "DB_TYPE"
        value = local.computed_db_url != "" ? "postgres" : "sqlite"
      }

      env {
        name  = "DATABASE_URL"
        value = local.computed_db_url
      }

      env {
        name  = "JWT_SECRET"
        value = var.jwt_secret
      }

      env {
        name  = "BASE_URL"
        value = ""
      }
    }
  }

  depends_on = [
    google_project_service.enabled_apis,
    google_artifact_registry_repository.mobile_repo,
    google_secret_manager_secret_version.jwt_secret_ver,
    google_secret_manager_secret_version.db_url_ver
  ]
}

# Permitir acceso público / invocación de Cloud Run
resource "google_cloud_run_v2_service_iam_member" "public_access" {
  name     = google_cloud_run_v2_service.backend.name
  location = google_cloud_run_v2_service.backend.location
  role     = "roles/run.invoker"
  member   = "allUsers"
}

# ==============================================================================
# API GATEWAY
# ==============================================================================
resource "google_api_gateway_api" "mobile_api" {
  provider     = google-beta
  api_id       = "mobile-gateway-api"
  display_name = "Mobile Backend Gateway API"
  depends_on   = [google_project_service.enabled_apis]
}

resource "google_api_gateway_api_config" "mobile_cfg" {
  provider             = google-beta
  api                  = google_api_gateway_api.mobile_api.api_id
  api_config_id_prefix = "cfg-"
  display_name         = "Mobile API Config"

  openapi_documents {
    document {
      path = "openapi.yaml"
      contents = base64encode(templatefile("${path.module}/openapi.yaml", {
        cloud_run_url = google_cloud_run_v2_service.backend.uri
      }))
    }
  }

  gateway_config {
    backend_config {
      google_service_account = google_service_account.gateway_sa.email
    }
  }

  lifecycle {
    create_before_destroy = true
  }

  depends_on = [google_cloud_run_v2_service.backend]
}

resource "google_api_gateway_gateway" "mobile_gw" {
  provider     = google-beta
  api_config   = google_api_gateway_api_config.mobile_cfg.id
  gateway_id   = "mobile-api-gateway"
  region       = var.region
  display_name = "Mobile API Gateway"

  depends_on = [google_api_gateway_api_config.mobile_cfg]
}

# ==============================================================================
# PUB/SUB & CLOUD RUN NOTIFICACIONES (DESACOPLADO)
# ==============================================================================

# 1. Topic de Pub/Sub
resource "google_pubsub_topic" "notification_topic" {
  name    = var.notification_topic_name
  project = var.project_id

  depends_on = [google_project_service.enabled_apis]
}

# 2. Permiso para que el backend publique en el Topic
resource "google_pubsub_topic_iam_member" "backend_publisher" {
  project = var.project_id
  topic   = google_pubsub_topic.notification_topic.name
  role    = "roles/pubsub.publisher"
  member  = "serviceAccount:${google_service_account.cloudrun_sa.email}"
}

# 3. Service Account para invocar Cloud Run desde Pub/Sub Push
resource "google_service_account" "pubsub_invoker_sa" {
  account_id   = "pubsub-invoker-sa"
  display_name = "PubSub Invoker Service Account"
  project      = var.project_id
  depends_on   = [google_project_service.enabled_apis]
}

# 4. Cloud Run de Notificaciones (notification-cloud-run)
resource "google_cloud_run_v2_service" "notification_service" {
  name     = var.notification_service_name
  location = var.region
  ingress  = "INGRESS_TRAFFIC_ALL"

  template {
    service_account = google_service_account.cloudrun_sa.email

    containers {
      image = "${var.region}-docker.pkg.dev/${var.project_id}/${var.repository_id}/${var.notification_image_name}:${var.image_tag}"

      ports {
        container_port = 8080
      }

      resources {
        limits = {
          cpu    = "1000m"
          memory = "512Mi"
        }
      }

      env {
        name  = "SMTP_HOST"
        value = var.smtp_host
      }
      env {
        name  = "SMTP_PORT"
        value = var.smtp_port
      }
      env {
        name  = "SMTP_USER"
        value = var.smtp_user
      }
      env {
        name  = "SMTP_PASS"
        value = var.smtp_pass
      }
      env {
        name  = "SMTP_FROM"
        value = var.smtp_from
      }
    }
  }

  depends_on = [
    google_project_service.enabled_apis,
    google_artifact_registry_repository.mobile_repo
  ]
}

# 5. Permisos de Invocación para Cloud Run Notificaciones
resource "google_cloud_run_v2_service_iam_member" "notification_pubsub_invoker" {
  name     = google_cloud_run_v2_service.notification_service.name
  location = google_cloud_run_v2_service.notification_service.location
  role     = "roles/run.invoker"
  member   = "serviceAccount:${google_service_account.pubsub_invoker_sa.email}"
}

resource "google_cloud_run_v2_service_iam_member" "notification_public_access" {
  name     = google_cloud_run_v2_service.notification_service.name
  location = google_cloud_run_v2_service.notification_service.location
  role     = "roles/run.invoker"
  member   = "allUsers"
}

# 6. Suscripción Push de Pub/Sub -> Cloud Run Notificaciones
resource "google_pubsub_subscription" "notification_sub" {
  name  = var.notification_sub_name
  topic = google_pubsub_topic.notification_topic.name

  ack_deadline_seconds = 20

  push_config {
    push_endpoint = "${google_cloud_run_v2_service.notification_service.uri}/pubsub"

    oidc_token {
      service_account_email = google_service_account.pubsub_invoker_sa.email
    }
  }

  depends_on = [
    google_cloud_run_v2_service.notification_service,
    google_service_account.pubsub_invoker_sa
  ]
}

