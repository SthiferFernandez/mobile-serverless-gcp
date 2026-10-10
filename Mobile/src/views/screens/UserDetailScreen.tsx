import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { useUserViewModel } from '../../viewmodels/useUserViewModel';
import { useTheme } from '../../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { User } from '../../models/user.model';

export const UserDetailScreen = ({ route, navigation }: any) => {
  const { id } = route.params;
  const { getUserById, deleteUser } = useUserViewModel();
  const { colors } = useTheme();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, [id]);

  const loadUser = async () => {
    try {
      setLoading(true);
      const res = await getUserById(id);
      setUser(res);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    if (!user) return;
    Alert.alert(
      'Eliminar Usuario',
      `¿Deseas eliminar a ${user.nombre} ${user.apellido}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            const ok = await deleteUser(user.id);
            if (ok) {
              Alert.alert('Éxito', 'Usuario eliminado');
              navigation.goBack();
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.centerText, { color: colors.textSecondary }]}>
          Cargando detalle del usuario...
        </Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.danger }]}>Usuario no encontrado</Text>
        <TouchableOpacity
          style={[styles.backBtnSimple, { backgroundColor: colors.primary }]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backTextSimple}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.scroll}
    >
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Detalle de Usuario</Text>
        <View style={{ width: 24 }} />
      </View>

      <View
        style={[
          styles.profileCard,
          { backgroundColor: colors.card, borderColor: colors.cardBorder },
        ]}
      >
        <Image
          source={{
            uri:
              user.foto ||
              'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80',
          }}
          style={[styles.avatar, { borderColor: colors.primary, borderWidth: 2 }]}
        />
        <Text style={[styles.name, { color: colors.text }]}>
          {user.nombre} {user.apellido}
        </Text>
        <Text style={[styles.email, { color: colors.textSecondary }]}>{user.email}</Text>
        <View style={[styles.badge, { backgroundColor: colors.primaryLight }]}>
          <Text style={[styles.badgeText, { color: colors.accent }]}>
            ID de Usuario: #{user.id}
          </Text>
        </View>
      </View>

      <View
        style={[
          styles.infoCard,
          { backgroundColor: colors.card, borderColor: colors.cardBorder },
        ]}
      >
        <Text style={[styles.sectionHeader, { color: colors.text }]}>
          Información del Registro
        </Text>

        <View style={styles.infoRow}>
          <Ionicons name="calendar-outline" size={20} color={colors.textMuted} />
          <View>
            <Text style={[styles.infoLabel, { color: colors.textMuted }]}>Fecha de Creación</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>
              {new Date(user.createdAt).toLocaleString()}
            </Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="shield-checkmark-outline" size={20} color={colors.success} />
          <View>
            <Text style={[styles.infoLabel, { color: colors.textMuted }]}>
              Seguridad de la Contraseña
            </Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>
              Protegida con Bcrypt (Salt Cost 10)
            </Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="image-outline" size={20} color={colors.accent} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.infoLabel, { color: colors.textMuted }]}>Ruta / URL de Foto</Text>
            <Text style={[styles.infoValue, { color: colors.text }]} numberOfLines={1}>
              {user.foto || 'Sin foto asignada'}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.editButton, { backgroundColor: colors.primary }]}
          onPress={() => navigation.navigate('UserForm', { id: user.id })}
        >
          <Ionicons name="pencil" size={18} color="#ffffff" />
          <Text style={styles.btnText}>Editar Usuario</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.deleteButton, { backgroundColor: colors.danger }]}
          onPress={handleDelete}
        >
          <Ionicons name="trash" size={18} color="#ffffff" />
          <Text style={styles.btnText}>Eliminar</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    padding: 20,
    paddingTop: 50,
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  backBtn: {
    padding: 6,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  profileCard: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    marginBottom: 16,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    marginBottom: 14,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  email: {
    fontSize: 14,
    marginTop: 4,
  },
  badge: {
    marginTop: 12,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  infoCard: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  infoLabel: {
    fontSize: 11,
    textTransform: 'uppercase',
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  editButton: {
    flex: 2,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 10,
  },
  deleteButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 10,
  },
  btnText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerText: {
    marginTop: 10,
    fontSize: 13,
  },
  errorText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  backBtnSimple: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  backTextSimple: {
    color: '#ffffff',
    fontWeight: '600',
  },
});
