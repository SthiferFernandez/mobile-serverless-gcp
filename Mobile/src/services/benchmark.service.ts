import { apiService } from './api.service';

export class BenchmarkService {
  /**
   * Ejecuta una tarea remota de prueba con delay simulado en el servidor
   */
  static async runRemoteTask(id: number, delayMs: number = 600): Promise<{ taskId: number; delayMs: number }> {
    return await apiService.get<{ taskId: number; delayMs: number }>(`/benchmark/task/${id}?delay=${delayMs}`);
  }

  /**
   * Ejecuta una tarea local simulada
   */
  static async runLocalTask(id: number, durationMs: number = 500): Promise<number> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(id);
      }, durationMs);
    });
  }
}
