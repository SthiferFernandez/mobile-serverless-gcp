# ========================================================
# DEMOSTRACIÓN EN VIVO DE TERRAFORM DESDE CERO
# ========================================================

# 1. Indicamos a Terraform que usaremos Google Cloud
terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

# 2. Configuramos el proveedor con nuestro proyecto y región
provider "google" {
  project = "semana-3-sthifer"
  region  = "us-central1"
}

# 3. Definimos el recurso que queremos crear
# (En este caso, un Bucket de almacenamiento en Cloud Storage)
resource "google_storage_bucket" "bucket_demo" {
  name          = "demo-profesor-sthifer-2026"
  location      = "US-CENTRAL1"
  force_destroy = true # Permite borrarlo fácilmente con terraform destroy
}

# 4. Mostramos el resultado en pantalla una vez creado
output "mensaje_exito" {
  value = "¡Bucket creado exitosamente con Terraform!"
}

output "url_del_bucket" {
  value = google_storage_bucket.bucket_demo.url
}
