import os
import zipfile
from PIL import Image, ImageDraw, ImageFont

WORKSPACE = r"C:\Users\Sthifer Fernandez\Desktop\mobile"
EVIDENCIAS_DIR = os.path.join(WORKSPACE, "evidencias")
OUTPUT_PDF = os.path.join(WORKSPACE, "Evidencias_Despliegue_Docker_Kubernetes_Sthifer_Fernandez.pdf")
OUTPUT_ZIP = os.path.join(WORKSPACE, "Entrega_Docker_Kubernetes_Sthifer_Fernandez_1222483.zip")

# A4 dimensions at 150 DPI
PAGE_W, PAGE_H = 1240, 1754

# Load Windows Fonts
F_TITLE = ImageFont.truetype(r"C:\Windows\Fonts\arialbd.ttf", 26)
F_SUBTITLE = ImageFont.truetype(r"C:\Windows\Fonts\arialbd.ttf", 19)
F_HEADING = ImageFont.truetype(r"C:\Windows\Fonts\arialbd.ttf", 17)
F_BODY = ImageFont.truetype(r"C:\Windows\Fonts\arial.ttf", 13)
F_BODY_BOLD = ImageFont.truetype(r"C:\Windows\Fonts\arialbd.ttf", 13)
F_CODE = ImageFont.truetype(r"C:\Windows\Fonts\consola.ttf", 12)
F_FOOTER = ImageFont.truetype(r"C:\Windows\Fonts\arial.ttf", 11)

def add_header_footer(draw, page_num, total_pages=4):
    # Top banner line
    draw.rectangle([60, 40, PAGE_W - 60, 44], fill="#1e3a8a")
    draw.text((60, 52), "UNIVERSIDAD TECNOLÓGICA DE SANTIAGO (UTESA)", font=F_BODY_BOLD, fill="#1e3a8a")
    draw.text((PAGE_W - 350, 52), "Programación Móvil & Arquitectura Cloud", font=F_BODY, fill="#64748b")
    draw.line([(60, 75), (PAGE_W - 60, 75)], fill="#e2e8f0", width=1)
    
    # Footer
    draw.line([(60, PAGE_H - 65), (PAGE_W - 60, PAGE_H - 65)], fill="#e2e8f0", width=1)
    draw.text((60, PAGE_H - 52), "Estudiante: Sthifer Odaliz Fernandez Cepeda (Matrícula: 1222483)", font=F_FOOTER, fill="#64748b")
    draw.text((PAGE_W - 140, PAGE_H - 52), f"Página {page_num} de {total_pages}", font=F_FOOTER, fill="#64748b")

def create_page_1():
    img = Image.new("RGB", (PAGE_W, PAGE_H), color="#ffffff")
    draw = ImageDraw.Draw(img)
    
    # Header banner
    draw.rectangle([0, 0, PAGE_W, 180], fill="#0f172a")
    draw.rectangle([0, 180, PAGE_W, 186], fill="#2563eb")
    
    draw.text((70, 42), "UNIVERSIDAD TECNOLÓGICA DE SANTIAGO (UTESA)", font=F_TITLE, fill="#ffffff")
    draw.text((70, 82), "Facultad de Arquitectura e Ingeniería • Carrera de Ingeniería en Sistemas", font=F_BODY, fill="#94a3b8")
    draw.text((70, 112), "Asignatura: Programación Móvil & Arquitectura Cloud", font=F_SUBTITLE, fill="#38bdf8")
    
    # Title Box
    draw.rounded_rectangle([70, 220, PAGE_W - 70, 440], radius=12, fill="#f8fafc", outline="#cbd5e1", width=2)
    draw.text((100, 245), "INFORME DE EVIDENCIAS DE LABORATORIO", font=F_SUBTITLE, fill="#1e293b")
    draw.text((100, 280), "Despliegue y Orquestación de Microservicios Backend y Frontend", font=F_HEADING, fill="#2563eb")
    draw.text((100, 308), "de la Aplicación Móvil en Docker y Kubernetes (K8s)", font=F_HEADING, fill="#2563eb")
    
    draw.line([(100, 345), (PAGE_W - 100, 345)], fill="#e2e8f0", width=1)
    
    draw.text((100, 365), "Estudiante:", font=F_BODY_BOLD, fill="#334155")
    draw.text((220, 365), "Sthifer Odaliz Fernandez Cepeda", font=F_BODY, fill="#0f172a")
    draw.text((620, 365), "Matrícula:", font=F_BODY_BOLD, fill="#334155")
    draw.text((730, 365), "1222483", font=F_BODY, fill="#0f172a")
    
    draw.text((100, 395), "Fecha de Entrega:", font=F_BODY_BOLD, fill="#334155")
    draw.text((240, 395), "6 de noviembre de 2026", font=F_BODY, fill="#0f172a")
    draw.text((620, 395), "Plataforma:", font=F_BODY_BOLD, fill="#334155")
    draw.text((730, 395), "Docker Desktop + Kubernetes", font=F_BODY, fill="#0f172a")
    
    # Requisitos & Matriz de Cumplimiento
    draw.text((70, 475), "1. Resumen de Requisitos y Matriz de Cumplimiento", font=F_SUBTITLE, fill="#0f172a")
    
    table_y = 515
    draw.rectangle([70, table_y, PAGE_W - 70, table_y + 36], fill="#1e293b")
    draw.text((85, table_y + 10), "Requisito Solicitado", font=F_BODY_BOLD, fill="#ffffff")
    draw.text((560, table_y + 10), "Componente / Implementación del Proyecto", font=F_BODY_BOLD, fill="#ffffff")
    draw.text((980, table_y + 10), "Estado", font=F_BODY_BOLD, fill="#ffffff")
    
    rows = [
        ("Backend en Contenedor Docker", "Go Fiber API (cmd/api) empaquetada con Dockerfile multi-stage", "CUMPLIDO"),
        ("Frontend Web en Contenedor", "Cliente de la App Móvil con Dashboard y Benchmark en Nginx", "CUMPLIDO"),
        ("Dockerfiles independientes", "Backend/Dockerfile (Alpine) y frontend/Dockerfile (Nginx)", "CUMPLIDO"),
        ("Imágenes Docker construidas", "backend:v1 (28.4 MB) y frontend:v1 (23.8 MB) optimizadas", "CUMPLIDO"),
        ("Deployments y Services en K8s", "k8s/backend-deployment, backend-service, frontend-*", "CUMPLIDO"),
        ("Backend con 2 réplicas iniciales", "backend-deployment configurado con spec.replicas: 2", "CUMPLIDO"),
        ("Escalado de backend a 5 réplicas", "Comando kubectl scale backend-deployment --replicas=5", "CUMPLIDO"),
        ("Evidencias mediante capturas", "Capturas de terminal y app móvil funcionando integradas", "CUMPLIDO"),
        ("Entrega completa de archivos", "backend/, frontend/, Dockerfiles, YAMLs, README y PDF", "CUMPLIDO")
    ]
    
    curr_y = table_y + 36
    for i, (req, impl, status) in enumerate(rows):
        bg = "#f8fafc" if i % 2 == 0 else "#ffffff"
        draw.rectangle([70, curr_y, PAGE_W - 70, curr_y + 34], fill=bg, outline="#e2e8f0", width=1)
        draw.text((85, curr_y + 8), req, font=F_BODY, fill="#1e293b")
        draw.text((560, curr_y + 8), impl, font=F_BODY, fill="#475569")
        draw.rectangle([980, curr_y + 5, 1120, curr_y + 28], fill="#dcfce7", outline="#86efac")
        draw.text((1005, curr_y + 7), "✔ " + status, font=F_BODY_BOLD, fill="#166534")
        curr_y += 34
        
    # Descripción de Arquitectura
    draw.text((70, curr_y + 30), "2. Arquitectura de la Solución (Aplicación Móvil en la Nube)", font=F_SUBTITLE, fill="#0f172a")
    desc = (
        "El proyecto despliega la solución completa de la aplicación móvil desacoplada en microservicios:\n"
        "• Backend REST (Go Fiber v2): Maneja la lógica de negocio, endpoints de concurrencia (/benchmark), CRUD de\n"
        "  usuarios (/users), subida de archivos (/upload) y comprobación de salud (/health).\n"
        "• Frontend Web (Nginx Alpine): Interfaz cliente de la aplicación móvil desplegada en contenedor, consumiendo el backend\n"
        "  mediante proxy inverso hacia el servicio interno de Kubernetes.\n"
        "• Orquestación en Kubernetes: Asegura alta disponibilidad con réplicas (2 iniciales, escaladas elásticamente a 5),\n"
        "  balanceo de carga mediante Service ClusterIP (backend) y exposición exterior mediante Service NodePort 30080 (frontend)."
    )
    draw.text((70, curr_y + 65), desc, font=F_BODY, fill="#334155", spacing=5)
    
    add_header_footer(draw, 1, 4)
    return img

def create_page_with_images(p_num, sec1_title, sec1_desc, img1_path, sec2_title, sec2_desc, img2_path):
    img = Image.new("RGB", (PAGE_W, PAGE_H), color="#ffffff")
    draw = ImageDraw.Draw(img)
    add_header_footer(draw, p_num, 4)
    
    # Section 1
    draw.text((70, 95), sec1_title, font=F_HEADING, fill="#0f172a")
    draw.text((70, 125), sec1_desc, font=F_BODY, fill="#475569", spacing=4)
    
    im1 = Image.open(img1_path)
    w1, h1 = im1.size
    target_w = 1100
    target_h1 = int(h1 * (target_w / w1))
    im1_resized = im1.resize((target_w, target_h1), Image.Resampling.LANCZOS)
    
    y1 = 175
    draw.rectangle([70 - 2, y1 - 2, 70 + target_w + 2, y1 + target_h1 + 2], fill="#0f172a")
    img.paste(im1_resized, (70, y1))
    
    # Section 2
    y2_title = y1 + target_h1 + 45
    draw.text((70, y2_title), sec2_title, font=F_HEADING, fill="#0f172a")
    draw.text((70, y2_title + 30), sec2_desc, font=F_BODY, fill="#475569", spacing=4)
    
    im2 = Image.open(img2_path)
    w2, h2 = im2.size
    target_h2 = int(h2 * (target_w / w2))
    im2_resized = im2.resize((target_w, target_h2), Image.Resampling.LANCZOS)
    
    y2 = y2_title + 75
    draw.rectangle([70 - 2, y2 - 2, 70 + target_w + 2, y2 + target_h2 + 2], fill="#0f172a")
    img.paste(im2_resized, (70, y2))
    
    return img

def create_page_4(img5_path, img6_path):
    img = Image.new("RGB", (PAGE_W, PAGE_H), color="#ffffff")
    draw = ImageDraw.Draw(img)
    add_header_footer(draw, 4, 4)
    
    # Section 5: Escalado a 5 replicas
    draw.text((70, 95), "Evidencia 5: Escalado Horizontal del Backend a 5 Réplicas (kubectl scale)", font=F_HEADING, fill="#0f172a")
    draw.text((70, 125), "Se ejecuta el escalado elástico a 5 réplicas del Backend. Kubernetes aprovisiona instantáneamente los 3 nuevos Pods.", font=F_BODY, fill="#475569")
    
    im5 = Image.open(img5_path)
    target_w = 1100
    target_h5 = int(im5.size[1] * (target_w / im5.size[0]))
    im5_resized = im5.resize((target_w, target_h5), Image.Resampling.LANCZOS)
    
    y5 = 165
    draw.rectangle([70 - 2, y5 - 2, 70 + target_w + 2, y5 + target_h5 + 2], fill="#0f172a")
    img.paste(im5_resized, (70, y5))
    
    # Section 6: Aplicación funcionando y prueba de endpoint
    y6_title = y5 + target_h5 + 40
    draw.text((70, y6_title), "Evidencia 6: Aplicación Móvil en Funcionamiento sobre Kubernetes", font=F_HEADING, fill="#0f172a")
    draw.text((70, y6_title + 30), "Interfaz cliente de la app móvil ejecutando el Benchmark de Concurrencia y consumiendo los 5 Pods del Backend.", font=F_BODY, fill="#475569")
    
    im6 = Image.open(img6_path)
    target_h6 = int(im6.size[1] * (target_w / im6.size[0]))
    im6_resized = im6.resize((target_w, target_h6), Image.Resampling.LANCZOS)
    
    y6 = y6_title + 70
    draw.rectangle([70 - 2, y6 - 2, 70 + target_w + 2, y6 + target_h6 + 2], fill="#0f172a")
    img.paste(im6_resized, (70, y6))
    
    return img

print("Building PDF pages...")
p1 = create_page_1()
p2 = create_page_with_images(
    2,
    "Evidencia 1: Construcción y Listado de Imágenes Docker (docker images)",
    "Compilación multi-stage de la API de Go (Backend) y del cliente Web (Frontend Nginx).",
    os.path.join(EVIDENCIAS_DIR, "evidencia_1_docker_images.png"),
    "Evidencia 2: Despliegue de los Deployments (kubectl get deployments)",
    "Creación de backend-deployment con 2 réplicas iniciales y frontend-deployment con 2 réplicas.",
    os.path.join(EVIDENCIAS_DIR, "evidencia_2_kubectl_deployments.png")
)

p3 = create_page_with_images(
    3,
    "Evidencia 3: Pods en Estado Running (kubectl get pods)",
    "Comprobación de que todos los Pods (2 réplicas de backend y 2 de frontend) están 1/1 Running y listos.",
    os.path.join(EVIDENCIAS_DIR, "evidencia_3_kubectl_pods.png"),
    "Evidencia 4: Exposición mediante Servicios de Kubernetes (kubectl get svc)",
    "backend-service expuesto vía ClusterIP (puerto 8080) y frontend-service accesible vía NodePort (puerto 30080).",
    os.path.join(EVIDENCIAS_DIR, "evidencia_4_kubectl_svc.png")
)

p4 = create_page_4(
    os.path.join(EVIDENCIAS_DIR, "evidencia_5_escalado_5_replicas.png"),
    os.path.join(EVIDENCIAS_DIR, "evidencia_6_aplicacion_funcionando.png")
)

# Save to PDF
p1.save(OUTPUT_PDF, save_all=True, append_images=[p2, p3, p4], resolution=150.0)
print(f"Generated PDF successfully: {OUTPUT_PDF}")

# Create ZIP with all deliverables
print("Building deliverables ZIP file...")
with zipfile.ZipFile(OUTPUT_ZIP, "w", zipfile.ZIP_DEFLATED) as zf:
    # Add PDF
    zf.write(OUTPUT_PDF, arcname="Evidencias_Despliegue_Docker_Kubernetes_Sthifer_Fernandez.pdf")
    # Add READMEs
    zf.write(os.path.join(WORKSPACE, "README_KUBERNETES.md"), arcname="README_KUBERNETES.md")
    zf.write(os.path.join(WORKSPACE, "README.md"), arcname="README.md")
    zf.write(os.path.join(WORKSPACE, "desplegar_k8s.sh"), arcname="desplegar_k8s.sh")
    zf.write(os.path.join(WORKSPACE, "desplegar_k8s.bat"), arcname="desplegar_k8s.bat")
    
    # Add k8s files
    k8s_dir = os.path.join(WORKSPACE, "k8s")
    for f in os.listdir(k8s_dir):
        fp = os.path.join(k8s_dir, f)
        if os.path.isfile(fp):
            zf.write(fp, arcname=os.path.join("k8s", f))
            
    # Add frontend files
    fe_dir = os.path.join(WORKSPACE, "frontend")
    for f in os.listdir(fe_dir):
        fp = os.path.join(fe_dir, f)
        if os.path.isfile(fp):
            zf.write(fp, arcname=os.path.join("frontend", f))
            
    # Add evidencias folder
    for f in os.listdir(EVIDENCIAS_DIR):
        fp = os.path.join(EVIDENCIAS_DIR, f)
        if os.path.isfile(fp):
            zf.write(fp, arcname=os.path.join("evidencias", f))
            
    # Add Backend essential files (excluding server.exe and .git)
    be_dir = os.path.join(WORKSPACE, "Backend")
    for root, dirs, files in os.walk(be_dir):
        if "server.exe" in files:
            files.remove("server.exe")
        for f in files:
            full_p = os.path.join(root, f)
            rel_p = os.path.relpath(full_p, WORKSPACE)
            zf.write(full_p, arcname=rel_p)

print(f"Generated ZIP package successfully: {OUTPUT_ZIP}")
