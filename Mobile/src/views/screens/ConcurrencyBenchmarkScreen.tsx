import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useBenchmarkViewModel } from '../../viewmodels/useBenchmarkViewModel';
import { useTheme } from '../../context/ThemeContext';
import { Header } from '../components/Header';
import { Ionicons } from '@expo/vector-icons';
import { BenchmarkTaskItem } from '../../models/benchmark.model';

export const ConcurrencyBenchmarkScreen = () => {
  const {
    isRunning,
    currentStage,
    sequentialTasks,
    concurrentTasks,
    result,
    runFullBenchmark,
  } = useBenchmarkViewModel();

  const { colors, isDark } = useTheme();

  const renderTaskItem = (task: BenchmarkTaskItem, color: string) => {
    let icon = 'ellipse-outline';
    let statusText = 'En espera';

    if (task.status === 'running') {
      icon = 'sync';
      statusText = 'Procesando...';
    } else if (task.status === 'completed') {
      icon = 'checkmark-circle';
      statusText = `${task.durationMs} ms`;
    }

    return (
      <View
        key={task.id}
        style={[
          styles.taskRow,
          { borderBottomColor: colors.cardBorder },
        ]}
      >
        <View style={styles.taskLeft}>
          <Ionicons
            name={icon as any}
            size={18}
            color={
              task.status === 'completed'
                ? colors.success
                : task.status === 'running'
                ? color
                : colors.textMuted
            }
          />
          <Text style={[styles.taskName, { color: colors.text }]}>{task.name}</Text>
        </View>
        <Text
          style={[
            styles.taskStatus,
            task.status === 'completed' && { color: colors.success, fontWeight: 'bold' },
            task.status === 'running' && { color, fontWeight: 'bold' },
            task.status === 'idle' && { color: colors.textMuted },
          ]}
        >
          {statusText}
        </Text>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Concurrencia" subtitle="Comparación Secuencial vs Paralelo" />

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* BANNER PRINCIPAL */}
        <View
          style={[
            styles.heroCard,
            {
              backgroundColor: isDark ? '#230f45' : '#1e293b',
              borderColor: colors.cardBorder,
              borderWidth: 1,
            },
          ]}
        >
          <View style={styles.heroHeader}>
            <View
              style={[
                styles.chipTag,
                { backgroundColor: isDark ? '#3d1b78' : '#334155' },
              ]}
            >
              <Ionicons name="hardware-chip-outline" size={14} color="#ffffff" />
              <Text style={styles.chipText}>React Native Concurrency</Text>
            </View>
            <Text style={[styles.techBadge, { color: colors.accent }]}>
              Mecanismo: Promise.all()
            </Text>
          </View>

          <Text style={styles.heroTitle}>Módulo de Evaluación Práctica</Text>
          <Text style={styles.heroDesc}>
            Ejecuta 5 operaciones independientes de procesamiento/comunicación I/O con el backend
            Go Fiber y compara el tiempo de ejecución secuencial vs concurrente.
          </Text>

          <TouchableOpacity
            style={[
              styles.startBtn,
              { backgroundColor: colors.primary },
              isRunning && styles.btnDisabled,
            ]}
            onPress={() => runFullBenchmark(5, 600)}
            disabled={isRunning}
          >
            {isRunning ? (
              <>
                <ActivityIndicator color="#ffffff" size="small" />
                <Text style={styles.startBtnText}>
                  {currentStage === 'sequential'
                    ? 'Fase 1: Ejecutando Secuencial...'
                    : 'Fase 2: Ejecutando Concurrente...'}
                </Text>
              </>
            ) : (
              <>
                <Ionicons name="play" size={18} color="#ffffff" />
                <Text style={styles.startBtnText}>
                  {result ? 'Volver a Ejecutar Comparativa' : 'Iniciar Comparativa en Vivo'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* TARJETAS DE RESULTADOS Y MÉTRICAS (PUNTO 8) */}
        {result && (
          <View
            style={[
              styles.resultCard,
              { backgroundColor: colors.card, borderColor: colors.cardBorder },
            ]}
          >
            <View style={styles.resultHeader}>
              <Ionicons name="trophy-outline" size={24} color={colors.success} />
              <Text style={[styles.resultTitle, { color: colors.text }]}>
                Resultados de la Medición
              </Text>
            </View>

            <View style={styles.comparisonGrid}>
              <View
                style={[
                  styles.compareBox,
                  {
                    backgroundColor: colors.warningLight,
                    borderColor: colors.warning,
                  },
                ]}
              >
                <Text style={[styles.compareLabel, { color: colors.warning }]}>
                  🔴 Tiempo Secuencial
                </Text>
                <Text style={[styles.compareValue, { color: colors.text }]}>
                  {(result.sequentialTimeMs / 1000).toFixed(2)} s
                </Text>
                <Text style={[styles.compareSub, { color: colors.textSecondary }]}>
                  ({result.sequentialTimeMs} ms)
                </Text>
              </View>

              <View
                style={[
                  styles.compareBox,
                  {
                    backgroundColor: colors.successLight,
                    borderColor: colors.success,
                  },
                ]}
              >
                <Text style={[styles.compareLabel, { color: colors.success }]}>
                  🟢 Tiempo Concurrente
                </Text>
                <Text style={[styles.compareValue, { color: colors.text }]}>
                  {(result.concurrentTimeMs / 1000).toFixed(2)} s
                </Text>
                <Text style={[styles.compareSub, { color: colors.textSecondary }]}>
                  ({result.concurrentTimeMs} ms)
                </Text>
              </View>
            </View>

            <View
              style={[
                styles.speedupBox,
                {
                  backgroundColor: colors.primaryLight,
                  borderColor: colors.cardBorder,
                },
              ]}
            >
              <View style={styles.speedupRow}>
                <Text style={[styles.speedupTitle, { color: colors.text }]}>
                  Factor de Aceleración:
                </Text>
                <Text style={[styles.speedupNumber, { color: colors.accent }]}>
                  🚀 {result.speedupFactor}x Más Rápido
                </Text>
              </View>
              <Text style={[styles.speedupDesc, { color: colors.textSecondary }]}>
                Reducción de latencia del{' '}
                <Text style={{ fontWeight: 'bold', color: colors.text }}>
                  {result.speedupPercentage}%
                </Text>{' '}
                al solapar las esperas I/O con el Event Loop de JavaScript y Go Fiber.
              </Text>
            </View>

            {/* GRÁFICO DE BARRAS VISUAL */}
            <View style={styles.barGraphContainer}>
              <Text style={[styles.barGraphTitle, { color: colors.text }]}>
                Comparativa Visual de Duración:
              </Text>

              <View style={styles.barRow}>
                <Text style={[styles.barLabel, { color: colors.textSecondary }]}>Secuencial</Text>
                <View
                  style={[styles.barTrack, { backgroundColor: colors.inputBg }]}
                >
                  <View style={[styles.barFill, styles.barFillSeq, { width: '100%' }]} />
                </View>
                <Text style={[styles.barTime, { color: colors.text }]}>
                  {(result.sequentialTimeMs / 1000).toFixed(2)}s
                </Text>
              </View>

              <View style={styles.barRow}>
                <Text style={[styles.barLabel, { color: colors.textSecondary }]}>Concurrente</Text>
                <View
                  style={[styles.barTrack, { backgroundColor: colors.inputBg }]}
                >
                  <View
                    style={[
                      styles.barFill,
                      styles.barFillCon,
                      {
                        width: `${Math.max(
                          (result.concurrentTimeMs / result.sequentialTimeMs) * 100,
                          15
                        )}%`,
                      },
                    ]}
                  />
                </View>
                <Text style={[styles.barTime, { color: colors.text }]}>
                  {(result.concurrentTimeMs / 1000).toFixed(2)}s
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* DETALLE DE TAREAS EN TIEMPO REAL */}
        {(sequentialTasks.length > 0 || concurrentTasks.length > 0) && (
          <View style={styles.tasksContainer}>
            {/* Monitor Secuencial */}
            <View
              style={[
                styles.tasksBlock,
                { backgroundColor: colors.card, borderColor: colors.cardBorder },
              ]}
            >
              <View
                style={[
                  styles.tasksBlockHeader,
                  { borderBottomColor: colors.cardBorder },
                ]}
              >
                <Text style={[styles.tasksBlockTitle, { color: colors.text }]}>
                  1. Ejecución Secuencial
                </Text>
                <Text style={[styles.tasksBlockSub, { color: colors.textSecondary }]}>
                  Tarea 1 → Tarea 2 → Tarea 3...
                </Text>
              </View>
              {sequentialTasks.map((t) => renderTaskItem(t, colors.warning))}
            </View>

            {/* Monitor Concurrente */}
            <View
              style={[
                styles.tasksBlock,
                { backgroundColor: colors.card, borderColor: colors.cardBorder },
              ]}
            >
              <View
                style={[
                  styles.tasksBlockHeader,
                  { borderBottomColor: colors.cardBorder },
                ]}
              >
                <Text style={[styles.tasksBlockTitle, { color: colors.text }]}>
                  2. Ejecución Concurrente
                </Text>
                <Text style={[styles.tasksBlockSub, { color: colors.textSecondary }]}>
                  Todas simultáneas con Promise.all()
                </Text>
              </View>
              {concurrentTasks.map((t) => renderTaskItem(t, colors.success))}
            </View>
          </View>
        )}

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    padding: 16,
    paddingBottom: 40,
  },
  heroCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  chipTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  chipText: {
    fontSize: 11,
    color: '#ffffff',
    fontWeight: '600',
  },
  techBadge: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  heroDesc: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 6,
    lineHeight: 18,
    marginBottom: 16,
  },
  startBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 10,
  },
  btnDisabled: {
    opacity: 0.7,
  },
  startBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  resultCard: {
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    marginBottom: 16,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  resultTitle: {
    fontSize: 17,
    fontWeight: 'bold',
  },
  comparisonGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  compareBox: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  compareLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  compareValue: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 4,
  },
  compareSub: {
    fontSize: 11,
    marginTop: 2,
  },
  speedupBox: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  speedupRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  speedupTitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  speedupNumber: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  speedupDesc: {
    fontSize: 12,
    marginTop: 4,
    lineHeight: 16,
  },
  barGraphContainer: {
    marginTop: 6,
  },
  barGraphTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 10,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  barLabel: {
    width: 74,
    fontSize: 11,
    fontWeight: '600',
  },
  barTrack: {
    flex: 1,
    height: 12,
    borderRadius: 6,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 6,
  },
  barFillSeq: {
    backgroundColor: '#f59e0b',
  },
  barFillCon: {
    backgroundColor: '#10b981',
  },
  barTime: {
    width: 44,
    fontSize: 11,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  tasksContainer: {
    gap: 12,
    marginBottom: 16,
  },
  tasksBlock: {
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
  },
  tasksBlockHeader: {
    marginBottom: 10,
    borderBottomWidth: 1,
    paddingBottom: 6,
  },
  tasksBlockTitle: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  tasksBlockSub: {
    fontSize: 11,
    marginTop: 1,
  },
  taskRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  taskLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  taskName: {
    fontSize: 13,
  },
  taskStatus: {
    fontSize: 12,
    fontWeight: '500',
  },
});

