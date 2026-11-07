import time
import urllib.request
import concurrent.futures

URL = "http://localhost:30080/health"
TOTAL_REQUESTS = 500
CONCURRENCY = 20

def send_request(req_id):
    start = time.time()
    try:
        req = urllib.request.Request(URL)
        with urllib.request.urlopen(req, timeout=5) as response:
            status = response.getcode()
            elapsed = (time.time() - start) * 1000
            return (status == 200, elapsed)
    except Exception as e:
        return (False, 0)

print(f"Iniciando prueba de carga contra {URL}...")
print(f"Total peticiones: {TOTAL_REQUESTS} | Hilos concurrentes: {CONCURRENCY}")

t_start = time.time()
successes = 0
failures = 0
latencies = []

with concurrent.futures.ThreadPoolExecutor(max_workers=CONCURRENCY) as executor:
    futures = [executor.submit(send_request, i) for i in range(TOTAL_REQUESTS)]
    for future in concurrent.futures.as_completed(futures):
        ok, lat = future.result()
        if ok:
            successes += 1
            latencies.append(lat)
        else:
            failures += 1

total_time = time.time() - t_start
avg_lat = sum(latencies) / len(latencies) if latencies else 0
min_lat = min(latencies) if latencies else 0
max_lat = max(latencies) if latencies else 0
rps = TOTAL_REQUESTS / total_time

print("==================================================")
print("📊 RESULTADOS DE LA PRUEBA DE CARGA EN KUBERNETES")
print("==================================================")
print(f"✔ Peticiones exitosas (200 OK): {successes} / {TOTAL_REQUESTS} ({(successes/TOTAL_REQUESTS)*100:.1f}%)")
print(f"❌ Peticiones fallidas:         {failures}")
print(f"⏱️ Tiempo total de la prueba:   {total_time:.2f} segundos")
print(f"⚡ Peticiones por segundo (RPS): {rps:.2f} req/s")
print(f"📈 Latencia Promedio:           {avg_lat:.2f} ms")
print(f"🚀 Latencia Mínima:             {min_lat:.2f} ms")
print(f"⚠️ Latencia Máxima:             {max_lat:.2f} ms")
print("==================================================")

