import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  RefreshControl,
  Alert,
} from 'react-native';
import { useDashboardViewModel } from '../../viewmodels/useDashboardViewModel';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Header } from '../components/Header';
import { Ionicons } from '@expo/vector-icons';

export const DashboardScreen = ({ navigation }: any) => {
  const {
    profile,
    stats,
    notifications,
    loading,
    error,
    loadTimeMs,
    mode,
    refreshConcurrent,
    refreshSequential,
  } = useDashboardViewModel();

  const { logout } = useAuth();
  const { colors, isDark } = useTheme();

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que deseas salir para iniciar con otra cuenta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sí, Salir',
          style: 'destructive',
          onPress: async () => {
            await logout();
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Dashboard" subtitle="Consumo Simultáneo y Métricas" />

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refreshConcurrent}
            tintColor={colors.primary}
          />
        }
      >
        {/* TARJETA DE DEMOSTRACIÓN DE CONCURRENCIA (PUNTO 6) */}
        <View
          style={[
            styles.concurrencyCard,
            {
              backgroundColor: colors.card,
              borderColor: colors.cardBorder,
            },
          ]}
        >
          <View style={styles.badgeRow}>
            <View
              style={[
                styles.badge,
                mode === 'concurrent'
                  ? { backgroundColor: colors.successLight }
                  : { backgroundColor: colors.warningLight },
              ]}
            >
              <Ionicons
                name={mode === 'concurrent' ? 'flash-outline' : 'timer-outline'}
                size={14}
                color={mode === 'concurrent' ? colors.success : colors.warning}
              />
              <Text
                style={[
                  styles.badgeText,
                  { color: mode === 'concurrent' ? colors.success : colors.warning },
                ]}
              >
                Modo: {mode === 'concurrent' ? 'Concurrente (Promise.all)' : 'Secuencial'}
              </Text>
            </View>

            <Text style={[styles.timerText, { color: colors.textSecondary }]}>
              ⏱️ Carga: <Text style={[styles.timerBold, { color: colors.text }]}>{loadTimeMs} ms</Text>
            </Text>
          </View>

          <Text style={[styles.concurrencyDesc, { color: colors.textSecondary }]}>
            {mode === 'concurrent'
              ? 'Pide toda la información (perfil, usuarios, estadísticas y avisos) al mismo tiempo para que la pantalla cargue mucho más rápido.'
              : 'Pide la información paso a paso, esperando que termine una antes de empezar la siguiente.'}
          </Text>

          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.modeBtn, { backgroundColor: colors.success }]}
              onPress={refreshConcurrent}
              disabled={loading}
            >
              <Ionicons name="flash" size={16} color="#ffffff" />
              <Text style={styles.btnText}>Cargar Concurrente</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modeBtn, { backgroundColor: colors.warning }]}
              onPress={refreshSequential}
              disabled={loading}
            >
              <Ionicons name="hourglass-outline" size={16} color="#ffffff" />
              <Text style={styles.btnText}>Cargar Secuencial</Text>
            </TouchableOpacity>
          </View>
        </View>

        {loading && !profile && (
          <View style={styles.loaderCenter}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loaderText, { color: colors.textSecondary }]}>
              Cargando servicios concurrentes...
            </Text>
          </View>
        )}

        {/* PERFIL DEL USUARIO AUTENTICADO + BOTÓN DE CERRAR SESIÓN */}
        {profile && (
          <View
            style={[
              styles.profileCard,
              { backgroundColor: colors.card, borderColor: colors.cardBorder },
            ]}
          >
            <View style={styles.profileRow}>
              <Image
                source={{
                  uri:
                    profile.foto ||
                    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80',
                }}
                style={[styles.avatar, { borderColor: colors.primary, borderWidth: 1.5 }]}
              />
              <View style={styles.profileInfo}>
                <Text style={[styles.profileName, { color: colors.text }]}>
                  {profile.nombre} {profile.apellido}
                </Text>
                <Text style={[styles.profileEmail, { color: colors.textSecondary }]}>
                  {profile.email}
                </Text>
                <Text style={[styles.profileMeta, { color: colors.accent }]}>
                  ID: #{profile.id} • Sesión JWT Activa
                </Text>
              </View>
            </View>

            {/* BOTÓN DESTACADO PARA SALIR Y CAMBIAR DE CUENTA */}
            <TouchableOpacity
              style={[
                styles.logoutBarBtn,
                { backgroundColor: colors.dangerLight, borderColor: colors.danger },
              ]}
              onPress={handleLogout}
              activeOpacity={0.7}
            >
              <Ionicons name="log-out-outline" size={18} color={colors.danger} />
              <Text style={[styles.logoutBarText, { color: colors.danger }]}>
                Cerrar Sesión / Cambiar Cuenta
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* MÉTRICAS Y ESTADÍSTICAS DEL SERVIDOR */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Métricas del Sistema (GET /stats)
        </Text>
        <View style={styles.statsGrid}>
          <View
            style={[
              styles.statBox,
              { backgroundColor: colors.card, borderColor: colors.cardBorder },
            ]}
          >
            <View style={[styles.statIcon, { backgroundColor: colors.primaryLight }]}>
              <Ionicons name="people-outline" size={24} color={colors.accent} />
            </View>
            <Text style={[styles.statVal, { color: colors.text }]}>
              {stats ? stats.totalUsers : '-'}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Usuarios Totales
            </Text>
          </View>

          <View
            style={[
              styles.statBox,
              { backgroundColor: colors.card, borderColor: colors.cardBorder },
            ]}
          >
            <View style={[styles.statIcon, { backgroundColor: colors.successLight }]}>
              <Ionicons name="folder-outline" size={24} color={colors.success} />
            </View>
            <Text style={[styles.statVal, { color: colors.text }]}>
              {stats ? stats.totalFiles : '-'}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Archivos Subidos
            </Text>
          </View>

          <View
            style={[
              styles.statBox,
              { backgroundColor: colors.card, borderColor: colors.cardBorder },
            ]}
          >
            <View style={[styles.statIcon, { backgroundColor: colors.primaryLight }]}>
              <Ionicons name="server-outline" size={24} color={colors.primary} />
            </View>
            <Text style={[styles.statVal, { color: colors.text }]}>
              {stats ? stats.serverUptime : '-'}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Uptime Fiber API
            </Text>
          </View>

          <View
            style={[
              styles.statBox,
              { backgroundColor: colors.card, borderColor: colors.cardBorder },
            ]}
          >
            <View style={[styles.statIcon, { backgroundColor: colors.warningLight }]}>
              <Ionicons name="checkmark-circle-outline" size={24} color={colors.warning} />
            </View>
            <Text style={[styles.statVal, { color: colors.text, fontSize: 13 }]}>
              {stats ? 'GORM / DB OK' : '-'}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Estado Base Datos
            </Text>
          </View>
        </View>

        {/* ACCESOS DIRECTOS */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Accesos Directos</Text>
        <View style={styles.shortcutsGrid}>
          <TouchableOpacity
            style={[
              styles.shortcutBtn,
              { backgroundColor: colors.card, borderColor: colors.cardBorder },
            ]}
            onPress={() => navigation.navigate('UsersTab')}
          >
            <Ionicons name="person-add-outline" size={20} color={colors.primary} />
            <Text style={[styles.shortcutText, { color: colors.text }]}>CRUD Usuarios</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.shortcutBtn,
              { backgroundColor: colors.card, borderColor: colors.cardBorder },
            ]}
            onPress={() => navigation.navigate('UploadTab')}
          >
            <Ionicons name="cloud-upload-outline" size={20} color={colors.success} />
            <Text style={[styles.shortcutText, { color: colors.text }]}>Subir Archivos</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.shortcutBtn,
              { backgroundColor: colors.card, borderColor: colors.accent, borderWidth: 1.5 },
            ]}
            onPress={() => navigation.navigate('BenchmarkTab')}
          >
            <Ionicons name="speedometer-outline" size={20} color={colors.accent} />
            <Text style={[styles.shortcutText, { color: colors.accent, fontWeight: 'bold' }]}>
              Test Rendimiento
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.shortcutBtn,
              { backgroundColor: colors.card, borderColor: '#34A853', borderWidth: 1.5 },
            ]}
            onPress={() => navigation.navigate('NotificationsTab')}
          >
            <Ionicons name="mail-outline" size={20} color="#34A853" />
            <Text style={[styles.shortcutText, { color: '#34A853', fontWeight: 'bold' }]}>
              Enviar Pub/Sub
            </Text>
          </TouchableOpacity>
        </View>

        {/* NOTIFICACIONES CONCURRENTES (GET /notifications) */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Notificaciones del Sistema
        </Text>
        {notifications.map((item) => (
          <View
            key={item.id}
            style={[
              styles.notifCard,
              { backgroundColor: colors.card, borderColor: colors.cardBorder },
            ]}
          >
            <View style={[styles.notifDot, { backgroundColor: colors.accent }]} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.notifTitle, { color: colors.text }]}>{item.title}</Text>
              <Text style={[styles.notifMessage, { color: colors.textSecondary }]}>
                {item.message}
              </Text>
            </View>
          </View>
        ))}
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
    paddingBottom: 32,
  },
  concurrencyCard: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    elevation: 3,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  timerText: {
    fontSize: 12,
  },
  timerBold: {
    fontWeight: 'bold',
  },
  concurrencyDesc: {
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 12,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  modeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
  },
  btnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
  loaderCenter: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  loaderText: {
    marginTop: 8,
    fontSize: 13,
  },
  profileCard: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 14,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 17,
    fontWeight: 'bold',
  },
  profileEmail: {
    fontSize: 13,
    marginTop: 2,
  },
  profileMeta: {
    fontSize: 11,
    marginTop: 4,
    fontWeight: '500',
  },
  logoutBarBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 14,
  },
  logoutBarText: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 6,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    minWidth: '45%',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  statIcon: {
    width: 38,
    height: 38,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  statVal: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  shortcutsGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  shortcutBtn: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    gap: 6,
  },
  shortcutText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  notifCard: {
    borderRadius: 10,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 8,
    borderWidth: 1,
  },
  notifDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
  },
  notifTitle: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  notifMessage: {
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
  },
});
