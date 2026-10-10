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
import { ServerConfigModal } from '../components/ServerConfigModal';

export const LoginScreen = ({ navigation }: any) => {
  const { login, serverUrl } = useAuth();
  const { isDark, colors, toggleTheme } = useTheme();

  const [email, setEmail] = useState('sthifer@test.com');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Atención', 'Por favor ingresa correo y contraseña');
      return;
    }

    try {
      setLoading(true);
      const success = await login({ email: email.trim(), password });
      if (!success) {
        Alert.alert('Error', 'Credenciales incorrectas o servidor no disponible');
      }
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Error de conexión con el backend Go Fiber';
      Alert.alert(
        'Error al conectar',
        `${msg}\n\nVerifica que el backend esté encendido en: ${serverUrl}`
      );
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
        {/* Barra Superior con Cambiador de Tema y Configuración */}
        <View style={styles.topRight}>
          <TouchableOpacity
            style={[
              styles.configBtn,
              { backgroundColor: colors.card, borderColor: colors.cardBorder },
            ]}
            onPress={toggleTheme}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isDark ? 'sunny' : 'moon'}
              size={18}
              color={isDark ? '#fbbf24' : '#7c3aed'}
            />
            <Text style={[styles.configText, { color: colors.text }]}>
              {isDark ? 'Tema Claro' : 'Tema Morado'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.configBtn,
              { backgroundColor: colors.card, borderColor: colors.cardBorder },
            ]}
            onPress={() => setShowConfig(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="settings-outline" size={18} color={colors.textSecondary} />
            <Text style={[styles.configText, { color: colors.textSecondary }]}>
              Configurar API
            </Text>
          </TouchableOpacity>
        </View>

        {/* Identidad del Proyecto */}
        <View style={styles.brandContainer}>
          <View
            style={[
              styles.iconCircle,
              { backgroundColor: colors.primaryLight, borderColor: colors.cardBorder },
            ]}
          >
            <Ionicons name="hardware-chip-outline" size={42} color={colors.primary} />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>UTESA Mobile</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            React Native + Go Fiber Backend
          </Text>
          <Text
            style={[
              styles.badge,
              { backgroundColor: colors.primaryLight, color: colors.accent },
            ]}
          >
            Sthifer Fernandez • Mat: 1222483
          </Text>
        </View>

        {/* Tarjeta de Login */}
        <View
          style={[
            styles.card,
            { backgroundColor: colors.card, borderColor: colors.cardBorder, borderWidth: 1 },
          ]}
        >
          <Text style={[styles.cardTitle, { color: colors.text }]}>Iniciar Sesión</Text>

          <Text style={[styles.label, { color: colors.textSecondary }]}>
            Correo Electrónico
          </Text>
          <View
            style={[
              styles.inputContainer,
              { backgroundColor: colors.inputBg, borderColor: colors.border },
            ]}
          >
            <Ionicons
              name="mail-outline"
              size={20}
              color={colors.textMuted}
              style={styles.inputIcon}
            />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="ejemplo@test.com"
              placeholderTextColor={colors.textMuted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <Text style={[styles.label, { color: colors.textSecondary }]}>
            Contraseña
          </Text>
          <View
            style={[
              styles.inputContainer,
              { backgroundColor: colors.inputBg, borderColor: colors.border },
            ]}
          >
            <Ionicons
              name="lock-closed-outline"
              size={20}
              color={colors.textMuted}
              style={styles.inputIcon}
            />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="••••••••"
              placeholderTextColor={colors.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color={colors.textMuted}
              />
            </TouchableOpacity>
          </View>

          {/* Botón Entrar */}
          <TouchableOpacity
            style={[
              styles.button,
              { backgroundColor: colors.primary },
              loading && styles.buttonDisabled,
            ]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <View style={styles.btnContent}>
                <Ionicons name="log-in-outline" size={20} color="#ffffff" />
                <Text style={styles.buttonText}>Entrar con JWT</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* BOTÓN PROMINENTE DE CREAR CUENTA NUEVA (SOLICITADO) */}
          <TouchableOpacity
            style={[
              styles.registerButton,
              {
                borderColor: colors.primary,
                backgroundColor: isDark ? '#331363' : '#f0f5ff',
              },
            ]}
            onPress={() => navigation.navigate('Register')}
            activeOpacity={0.7}
          >
            <Ionicons name="person-add-outline" size={18} color={colors.accent} />
            <Text style={[styles.registerButtonText, { color: colors.accent }]}>
              Crear una Cuenta Nueva
            </Text>
          </TouchableOpacity>

          {/* Usuario por defecto para prueba rápida */}
          <View
            style={[
              styles.presetBox,
              { backgroundColor: colors.inputBg, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.presetTitle, { color: colors.textMuted }]}>
              Usuario de Prueba Precargado:
            </Text>
            <TouchableOpacity
              onPress={() => {
                setEmail('sthifer@test.com');
                setPassword('admin123');
              }}
            >
              <Text style={[styles.presetLink, { color: colors.accent }]}>
                sthifer@test.com / admin123
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={[styles.serverInfo, { color: colors.textMuted }]}>
          Conectando a: {serverUrl}
        </Text>
      </ScrollView>

      <ServerConfigModal visible={showConfig} onClose={() => setShowConfig(false)} />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
    paddingTop: 50,
  },
  topRight: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginBottom: 16,
  },
  configBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
  },
  configText: {
    fontSize: 12,
    fontWeight: '600',
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  badge: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  card: {
    borderRadius: 16,
    padding: 20,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
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
    marginBottom: 14,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
  },
  button: {
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 6,
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
  registerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderRadius: 10,
    paddingVertical: 12,
    marginTop: 12,
  },
  registerButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  presetBox: {
    marginTop: 16,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
  },
  presetTitle: {
    fontSize: 11,
  },
  presetLink: {
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 2,
  },
  serverInfo: {
    textAlign: 'center',
    fontSize: 11,
    marginTop: 18,
  },
});
