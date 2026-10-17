# Guía Rápida para Demostración en Vivo con el Profesor

Si el profesor te dice:
> *"Quiero ver que lo hiciste tú. Créame algo nuevo en Terraform desde cero y despliégalo ahora mismo".*

Sigue estos 3 pasos infalibles usando **Google Cloud Shell** (no necesitas instalar nada en la máquina):

---

### Paso 1: Abrir la terminal de Google Cloud Shell
1. Entra a la consola de Google Cloud: https://console.cloud.google.com
2. Arriba a la derecha, haz clic en el ícono de terminal **`[ >_ ]` (Activar Cloud Shell)**.
3. Se abrirá una terminal abajo. Cloud Shell **ya tiene Terraform y gcloud instalados y autenticados con tu cuenta**.

---

### Paso 2: Crear la carpeta y el archivo en 10 segundos
Escribe o pega estos comandos en la terminal de Cloud Shell:

```bash
mkdir demo-terraform
cd demo-terraform
nano main.tf
```

Pega el contenido del archivo `main.tf` (puedes copiarlo directamente):

```hcl
terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

provider "google" {
  project = "semana-3-sthifer"
  region  = "us-central1"
}

resource "google_storage_bucket" "bucket_demo" {
  name          = "demo-profesor-sthifer-2026"
  location      = "US-CENTRAL1"
  force_destroy = true
}

output "mensaje" {
  value = "Bucket creado exitosamente con Terraform"
}
```

Para guardar en `nano`: presiona `Ctrl + O`, luego `Enter`, y luego `Ctrl + X` para salir.

---

### Paso 3: Ejecutar los 3 comandos mágicos de Terraform

1. **Inicializar** (descarga el plugin de Google):
   ```bash
   terraform init
   ```
   *Qué decirle al profesor:* *"Aquí Terraform descarga el proveedor oficial de Google Cloud para poder comunicarse con las APIs de GCP".*

2. **Planificar** (muestra qué va a crear sin hacer cambios todavía):
   ```bash
   terraform plan
   ```
   *Qué decirle al profesor:* *"Aquí Terraform compara el estado actual con el código y nos muestra el plan de ejecución: 1 recurso a agregar (+)".*

3. **Aplicar / Desplegar** (crea el recurso en vivo en GCP):
   ```bash
   terraform apply -auto-approve
   ```
   *Qué decirle al profesor:* *"Aquí Terraform envía la solicitud a la API de Google Cloud y provisiona el Cloud Storage Bucket de forma declarativa e inmutable".*

---

### Paso 4: Demostrarle el resultado al profesor en la consola
1. En Google Cloud Console, ve al menú lateral izquierdo -> **Cloud Storage** -> **Buckets**.
2. Muéstrale que aparece el bucket **`demo-profesor-sthifer-2026`** recién creado hace segundos.

---

### Paso 5 (Opcional - Para lucirte con el profesor):
Dile: *"Y para demostrar que la infraestructura como código permite ciclo de vida completo y no deja costos innecesarios, lo destruyo con un solo comando:"*

```bash
terraform destroy -auto-approve
```
El bucket desaparecerá de Google Cloud al instante.
