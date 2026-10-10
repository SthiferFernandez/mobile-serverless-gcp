import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

export const RegisterScreen = ({ navigation }: any) => {
  const { register } = useAuth();
  const { colors, isDark } = useTheme();

  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!nombre.trim() || !apellido.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Atención', 'Todos los campos son obligatorios');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Atención', 'La contraseña debe tener al menos 6 caracteres');
      return;
    }

    try {
      setLoading(true);
      const success = await register({
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        email: email.trim().toLowerCase(),
        password,
        foto: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80',
      });

      if (success) {
        Alert.alert(
          '¡Cuenta Creada con Éxito!',
          `Bienvenido ${nombre}. Tu cuenta ha sido registrada y tu sesión JWT ha iniciado automáticamente.`,
          [{ text: 'Comenzar', onPress: () => {} }]
        );
      } else {
        Alert.alert('Error', 'No se pudo completar el registro');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Error en el servidor';
      Alert.alert('Error de registro', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
          <Text style={[styles.backText, { color: colors.text }]}>Volver al Login</Text>
        </TouchableOpacity>

        <View
          style={[
            styles.card,
            { backgroundColor: colors.card, borderColor: colors.cardBorder, borderWidth: 1 },
          ]}
        >
          <View style={styles.cardHeaderRow}>
            <View
              style={[
                styles.iconBadge,
                { backgroundColor: colors.primaryLight, borderColor: colors.cardBorder },
              ]}
            >
              <Ionicons name="person-add" size={24} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>Crear Nueva Cuenta</Text>
              <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
                Regístrate para generar tu JWT en Go Fiber
              </Text>
            </View>
          </View>

          <Text style={[styles.label, { color: colors.textSecondary }]}>Nombre</Text>
          <View
            style={[
              styles.inputContainer,
              { backgroundColor: colors.inputBg, borderColor: colors.border },
            ]}
          >
            <Ionicons name="person-outline" size={18} color={colors.textMuted} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Ej. Sthifer"
              placeholderTextColor={colors.textMuted}
              value={nombre}
              onChangeText={setNombre}
            />
          </View>

          <Text style={[styles.label, { color: colors.textSecondary }]}>Apellido</Text>
          <View
            style={[
              styles.inputContainer,
              { backgroundColor: colors.inputBg, borderColor: colors.border },
            ]}
          >
            <Ionicons name="person-outline" size={18} color={colors.textMuted} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Ej. Fernandez"
              placeholderTextColor={colors.textMuted}
              value={apellido}
              onChangeText={setApellido}
            />
          </View>

          <Text style={[styles.label, { color: colors.textSecondary }]}>Correo Electrónico</Text>
          <View
            style={[
              styles.inputContainer,
              { backgroundColor: colors.inputBg, borderColor: colors.border },
            ]}
          >
            <Ionicons name="mail-outline" size={18} color={colors.textMuted} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="nombre@correo.com"
              placeholderTextColor={colors.textMuted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <Text style={[styles.label, { color: colors.textSecondary }]}>Contraseña</Text>
          <View
            style={[
              styles.inputContainer,
              { backgroundColor: colors.inputBg, borderColor: colors.border },
            ]}
          >
            <Ionicons name="lock-closed-outline" size={18} color={colors.textMuted} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Mínimo 6 caracteres"
              placeholderTextColor={colors.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={18}
                color={colors.textMuted}
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[
              styles.button,
              { backgroundColor: colors.primary },
              loading && styles.buttonDisabled,
            ]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <View style={styles.btnContent}>
                <Ionicons name="checkmark-circle-outline" size={20} color="#ffffff" />
                <Text style={styles.buttonText}>Registrar y Entrar</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    padding: 24,
    justifyContent: 'center',
    paddingTop: 50,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  backText: {
    fontSize: 15,
    fontWeight: '600',
  },
  card: {
    borderRadius: 16,
    padding: 20,
    elevation: 4,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  iconBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  cardSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 11,
    fontSize: 14,
  },
  button: {
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 14,
  },
  btnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'bold',
  },
});
