import { useState, useCallback } from 'react';
import { BenchmarkRepository } from '../repositories/benchmark.repository';
import { BenchmarkTaskItem, BenchmarkComparisonResult } from '../models/benchmark.model';

const benchmarkRepo = new BenchmarkRepository();

export function useBenchmarkViewModel() {
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [currentStage, setCurrentStage] = useState<'idle' | 'sequential' | 'concurrent' | 'done'>('idle');
  const [sequentialTasks, setSequentialTasks] = useState<BenchmarkTaskItem[]>([]);
  const [concurrentTasks, setConcurrentTasks] = useState<BenchmarkTaskItem[]>([]);
  const [result, setResult] = useState<BenchmarkComparisonResult | null>(null);

  const resetBenchmark = () => {
    setIsRunning(false);
    setCurrentStage('idle');
    setSequentialTasks([]);
    setConcurrentTasks([]);
    setResult(null);
  };

  const runFullBenchmark = useCallback(async (taskCount: number = 5, delayMs: number = 600) => {
    try {
      setIsRunning(true);
      setResult(null);

      // 1. Etapa Secuencial
      setCurrentStage('sequential');
      const initialSeq: BenchmarkTaskItem[] = Array.from({ length: taskCount }, (_, i) => ({
        id: i + 1,
        name: `Proceso #${i + 1}`,
        status: 'idle',
        durationMs: 0,
      }));
      setSequentialTasks(initialSeq);

      const seqRes = await benchmarkRepo.runSequential(taskCount, delayMs, (updated) => {
        setSequentialTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      });

      // 2. Etapa Concurrente
      setCurrentStage('concurrent');
      const initialCon: BenchmarkTaskItem[] = Array.from({ length: taskCount }, (_, i) => ({
        id: i + 1,
        name: `Proceso #${i + 1}`,
        status: 'idle',
        durationMs: 0,
      }));
      setConcurrentTasks(initialCon);

      const conRes = await benchmarkRepo.runConcurrent(taskCount, delayMs, (updated) => {
        setConcurrentTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      });

      // 3. Cálculo de Resultados y Comparación
      const seqTime = seqRes.totalDurationMs;
      const conTime = conRes.totalDurationMs;
      const speedup = Number((seqTime / Math.max(conTime, 1)).toFixed(2));
      const percentage = Math.round(((seqTime - conTime) / seqTime) * 100);

      const compResult: BenchmarkComparisonResult = {
        sequentialTimeMs: seqTime,
        concurrentTimeMs: conTime,
        speedupFactor: speedup,
        speedupPercentage: percentage,
        tasksCount: taskCount,
        executedAt: new Date().toLocaleTimeString(),
      };

      setResult(compResult);
      setCurrentStage('done');
    } catch (err) {
      console.error('Error running benchmark:', err);
    } finally {
      setIsRunning(false);
    }
  }, []);

  return {
    isRunning,
    currentStage,
    sequentialTasks,
    concurrentTasks,
    result,
    runFullBenchmark,
    resetBenchmark,
  };
}
