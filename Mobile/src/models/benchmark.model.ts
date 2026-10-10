export interface BenchmarkTaskItem {
  id: number;
  name: string;
  status: 'idle' | 'running' | 'completed' | 'error';
  durationMs: number;
  result?: any;
}

export interface BenchmarkComparisonResult {
  sequentialTimeMs: number;
  concurrentTimeMs: number;
  speedupPercentage: number;
  speedupFactor: number;
  tasksCount: number;
  executedAt: string;
}
