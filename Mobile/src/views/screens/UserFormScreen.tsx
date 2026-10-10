import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  Image,
} from 'react-native';
import { useUserViewModel } from '../../viewmodels/useUserViewModel';
import { useUploadViewModel } from '../../viewmodels/useUploadViewModel';
import { useTheme } from '../../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { apiService } from '../../services/api.service';

export const UserFormScreen = ({ route, navigation }: any) => {
  const userId = route?.params?.id;
  const isEditing = !!userId;

  const { createUser, updateUser, getUserById, saving } = useUserViewModel();
  const { pickSingleImage, uploadSingle, uploading } = useUploadViewModel();
  const { colors } = useTheme();

  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [foto, setFoto] = useState('');
  const [loadingInitial, setLoadingInitial] = useState(false);

  useEffect(() => {
    if (isEditing) {
      loadInitialData();
    }
  }, [userId]);

  const loadInitialData = async () => {
    try {
      setLoadingInitial(true);
      const user = await getUserById(userId);
      if (user) {
        setNombre(user.nombre);
        setApellido(user.apellido);
        setEmail(user.email);
        setFoto(user.foto || '');
      }
    } finally {
      setLoadingInitial(false);
    }
  };

  const handlePickAndUploadPhoto = async () => {
    const localUri = await pickSingleImage();
    if (!localUri) return;

    const uploadRes = await uploadSingle(localUri);
    if (uploadRes) {
      const fullUrl = `${apiService.getBaseUrl()}${uploadRes.url}`;
      setFoto(fullUrl);
      Alert.alert('Foto subida', 'La foto se subió exitosamente al servidor Go Fiber');
    }
  };

  const handleSave = async () => {
    if (!nombre.trim() || !apellido.trim() || !email.trim()) {
      Alert.alert('Atención', 'Nombre, apellido y correo son obligatorios');
      return;
    }

    if (!isEditing && !password.trim()) {
      Alert.alert('Atención', 'La contraseña es obligatoria para nuevos usuarios');
      return;
    }

    let success = false;
    if (isEditing) {
      success = await updateUser(userId, {
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        email: email.trim(),
        password: password.trim() || undefined,
        foto: foto.trim(),
      });
    } else {
      success = await createUser({
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        email: email.trim(),
        password: password.trim(),
        foto: foto.trim(),
      });
    }

    if (success) {
      Alert.alert(
        'Éxito',
        isEditing ? 'Usuario actualizado correctamente' : 'Usuario creado exitosamente',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } else {
      Alert.alert('Error', 'No se pudo guardar la información del usuario');
    }
  };

  if (loadingInitial) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.centerText, { color: colors.textSecondary }]}>
          Cargando datos del usuario...
        </Text>
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
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {isEditing ? 'Editar Usuario' : 'Nuevo Usuario'}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      {/* SECCIÓN DE FOTO DE PERFIL / SUBIDA DE ARCHIVO (PUNTO 3) */}
      <View style={styles.photoContainer}>
        <Image
          source={{
            uri:
              foto ||
              'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80',
          }}
          style={[styles.avatarLarge, { borderColor: colors.primary }]}
        />
        <TouchableOpacity
          style={[
            styles.changePhotoBtn,
            { backgroundColor: colors.primaryLight, borderColor: colors.cardBorder },
          ]}
          onPress={handlePickAndUploadPhoto}
          disabled={uploading}
        >
          {uploading ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <>
              <Ionicons name="camera-outline" size={18} color={colors.accent} />
              <Text style={[styles.changePhotoText, { color: colors.accent }]}>
                Subir/Cambiar Foto
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <View
        style={[
          styles.card,
          { backgroundColor: colors.card, borderColor: colors.cardBorder },
        ]}
      >
        <Text style={[styles.label, { color: colors.textSecondary }]}>Nombre</Text>
        <TextInput
          style={[
            styles.input,
            { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text },
          ]}
          placeholder="Nombre"
          placeholderTextColor={colors.textMuted}
          value={nombre}
          onChangeText={setNombre}
        />

        <Text style={[styles.label, { color: colors.textSecondary }]}>Apellido</Text>
        <TextInput
          style={[
            styles.input,
            { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text },
          ]}
          placeholder="Apellido"
          placeholderTextColor={colors.textMuted}
          value={apellido}
          onChangeText={setApellido}
        />

        <Text style={[styles.label, { color: colors.textSecondary }]}>Correo Electrónico</Text>
        <TextInput
          style={[
            styles.input,
            { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text },
          ]}
          placeholder="email@correo.com"
          placeholderTextColor={colors.textMuted}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={[styles.label, { color: colors.textSecondary }]}>
          {isEditing ? 'Nueva Contraseña (Opcional)' : 'Contraseña'}
        </Text>
        <TextInput
          style={[
            styles.input,
            { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text },
          ]}
          placeholder={isEditing ? 'Dejar en blanco para no cambiar' : 'Mínimo 6 caracteres'}
          placeholderTextColor={colors.textMuted}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <Text style={[styles.label, { color: colors.textSecondary }]}>URL de la Foto</Text>
        <TextInput
          style={[
            styles.input,
            { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text },
          ]}
          placeholder="https://... o vía botón de cámara"
          placeholderTextColor={colors.textMuted}
          value={foto}
          onChangeText={setFoto}
          autoCapitalize="none"
        />

        <TouchableOpacity
          style={[
            styles.saveBtn,
            { backgroundColor: colors.primary },
            saving && styles.btnDisabled,
          ]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.saveBtnText}>
              {isEditing ? 'Guardar Cambios' : 'Crear Usuario'}
            </Text>
          )}
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
  photoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarLarge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
  },
  changePhotoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
  },
  changePhotoText: {
    fontSize: 13,
    fontWeight: '600',
  },
  card: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  saveBtn: {
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 24,
  },
  btnDisabled: {
    opacity: 0.7,
  },
  saveBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'bold',
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
});
