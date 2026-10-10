import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ServerConfigModal } from './ServerConfigModal';

interface Props {
  title: string;
  subtitle?: string;
}

export const Header: React.FC<Props> = ({ title, subtitle }) => {
  const { user, logout } = useAuth();
  const { isDark, colors, toggleTheme } = useTheme();
  const insets = useSafeAreaInsets();
  const [modalVisible, setModalVisible] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      `¿Seguro que deseas salir de la cuenta de ${user?.nombre || 'usuario'}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sí, Salir',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (err) {
              console.error('Error al cerrar sesión:', err);
            }
          },
        },
      ]
    );
  };

  return (
    <>
      <View
        style={[
          styles.container,
          {
            paddingTop: Math.max(insets.top, 16) + 6,
            backgroundColor: colors.surface,
            borderBottomColor: colors.cardBorder,
          },
        ]}
      >
        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          {subtitle ? (
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {subtitle}
            </Text>
          ) : user ? (
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Hola, {user.nombre} {user.apellido}
            </Text>
          ) : null}
        </View>

        <View style={styles.actions}>
          {/* Botón de Modo Claro / Modo Oscuro Morado */}
          <TouchableOpacity
            style={[
              styles.iconBtn,
              { backgroundColor: colors.primaryLight, borderColor: colors.cardBorder },
            ]}
            onPress={toggleTheme}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            activeOpacity={0.7}
            accessibilityLabel="Cambiar Tema"
          >
            <Ionicons
              name={isDark ? 'sunny' : 'moon'}
              size={20}
              color={isDark ? '#fbbf24' : '#7c3aed'}
            />
          </TouchableOpacity>

          {/* Botón de Configuración del Servidor */}
          <TouchableOpacity
            style={[
              styles.iconBtn,
              { backgroundColor: colors.inputBg, borderColor: colors.cardBorder },
            ]}
            onPress={() => setModalVisible(true)}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            activeOpacity={0.7}
            accessibilityLabel="Configurar Servidor"
          >
            <Ionicons name="settings-outline" size={20} color={colors.textSecondary} />
          </TouchableOpacity>

          {/* Botón de Cerrar Sesión */}
          {user && (
            <TouchableOpacity
              style={[
                styles.iconBtn,
                styles.logoutBtn,
                { backgroundColor: colors.dangerLight, borderColor: colors.danger },
              ]}
              onPress={handleLogout}
              hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
              activeOpacity={0.6}
              accessibilityLabel="Cerrar Sesión"
            >
              <Ionicons name="log-out-outline" size={20} color={colors.danger} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ServerConfigModal visible={modalVisible} onClose={() => setModalVisible(false)} />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 18,
    paddingBottom: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  logoutBtn: {
    borderWidth: 1,
  },
});
