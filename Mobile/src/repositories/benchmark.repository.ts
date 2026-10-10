import { BenchmarkService } from '../services/benchmark.service';
import { BenchmarkTaskItem, BenchmarkComparisonResult } from '../models/benchmark.model';

export class BenchmarkRepository {
  /**
   * Ejecuta una batería de N tareas de forma SECUENCIAL
   * Tarea 1 -> espera -> Tarea 2 -> espera -> Tarea 3...
   */
  async runSequential(
    count: number = 5,
    delayMs: number = 600,
    onTaskUpdate?: (task: BenchmarkTaskItem) => void
  ): Promise<{ tasks: BenchmarkTaskItem[]; totalDurationMs: number }> {
    const tasks: BenchmarkTaskItem[] = Array.from({ length: count }, (_, i) => ({
      id: i + 1,
      name: `Proceso #${i + 1}`,
      status: 'idle',
      durationMs: 0,
    }));

    const startTotal = Date.now();

    for (let i = 0; i < count; i++) {
      tasks[i].status = 'running';
      onTaskUpdate?.({ ...tasks[i] });

      const taskStart = Date.now();
      try {
        await BenchmarkService.runRemoteTask(tasks[i].id, delayMs);
        tasks[i].status = 'completed';
      } catch {
        // Fallback local en caso de desconexión momentánea de red
        await BenchmarkService.runLocalTask(tasks[i].id, delayMs);
        tasks[i].status = 'completed';
      }
      tasks[i].durationMs = Date.now() - taskStart;
      onTaskUpdate?.({ ...tasks[i] });
    }

    const totalDurationMs = Date.now() - startTotal;
    return { tasks, totalDurationMs };
  }

  /**
   * Ejecuta una batería de N tareas de forma CONCURRENTE / PARALELA
   * Lanzando todas las promesas en simultáneo mediante Promise.all()
   */
  async runConcurrent(
    count: number = 5,
    delayMs: number = 600,
    onTaskUpdate?: (task: BenchmarkTaskItem) => void
  ): Promise<{ tasks: BenchmarkTaskItem[]; totalDurationMs: number }> {
    const tasks: BenchmarkTaskItem[] = Array.from({ length: count }, (_, i) => ({
      id: i + 1,
      name: `Proceso #${i + 1}`,
      status: 'idle',
      durationMs: 0,
    }));

    const startTotal = Date.now();

    // Marcamos todas como 'running' al mismo tiempo
    tasks.forEach((t) => {
      t.status = 'running';
      onTaskUpdate?.({ ...t });
    });

    const promises = tasks.map(async (task) => {
      const taskStart = Date.now();
      try {
        await BenchmarkService.runRemoteTask(task.id, delayMs);
        task.status = 'completed';
      } catch {
        await BenchmarkService.runLocalTask(task.id, delayMs);
        task.status = 'completed';
      }
      task.durationMs = Date.now() - taskStart;
      onTaskUpdate?.({ ...task });
      return task;
    });

    await Promise.all(promises);

    const totalDurationMs = Date.now() - startTotal;
    return { tasks, totalDurationMs };
  }

  /**
   * Ejecuta la comparación completa (Secuencial vs Concurrente)
   */
  async compareExecution(
    count: number = 5,
    delayMs: number = 600,
    onProgress?: (mode: 'sequential' | 'concurrent', task: BenchmarkTaskItem) => void
  ): Promise<BenchmarkComparisonResult> {
    // 1. Ejecutar Secuencial
    const seqResult = await this.runSequential(count, delayMs, (task) => onProgress?.('sequential', task));

    // 2. Ejecutar Concurrente
    const conResult = await this.runConcurrent(count, delayMs, (task) => onProgress?.('concurrent', task));

    const speedupFactor = Number((seqResult.totalDurationMs / Math.max(conResult.totalDurationMs, 1)).toFixed(2));
    const speedupPercentage = Math.round(((seqResult.totalDurationMs - conResult.totalDurationMs) / seqResult.totalDurationMs) * 100);

    return {
      sequentialTimeMs: seqResult.totalDurationMs,
      concurrentTimeMs: conResult.totalDurationMs,
      speedupFactor,
      speedupPercentage,
      tasksCount: count,
      executedAt: new Date().toLocaleTimeString(),
    };
  }
}
