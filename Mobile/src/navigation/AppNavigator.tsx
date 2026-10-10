import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { RootStackParamList, MainTabParamList } from './types';

// Screens
import { LoginScreen } from '../views/screens/LoginScreen';
import { RegisterScreen } from '../views/screens/RegisterScreen';
import { DashboardScreen } from '../views/screens/DashboardScreen';
import { UserListScreen } from '../views/screens/UserListScreen';
import { UserDetailScreen } from '../views/screens/UserDetailScreen';
import { UserFormScreen } from '../views/screens/UserFormScreen';
import { UploadScreen } from '../views/screens/UploadScreen';
import { ConcurrencyBenchmarkScreen } from '../views/screens/ConcurrencyBenchmarkScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const MainTabs = () => {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          borderTopColor: colors.tabBarBorder,
          borderTopWidth: 1,
          paddingBottom: 6,
          paddingTop: 6,
          height: 62,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: any = 'ellipse';

          if (route.name === 'DashboardTab') {
            iconName = focused ? 'grid' : 'grid-outline';
          } else if (route.name === 'UsersTab') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'UploadTab') {
            iconName = focused ? 'cloud-upload' : 'cloud-upload-outline';
          } else if (route.name === 'BenchmarkTab') {
            iconName = focused ? 'speedometer' : 'speedometer-outline';
          }

          return <Ionicons name={iconName} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="DashboardTab"
        component={DashboardScreen}
        options={{ tabBarLabel: 'Dashboard' }}
      />
      <Tab.Screen
        name="UsersTab"
        component={UserListScreen}
        options={{ tabBarLabel: 'Usuarios' }}
      />
      <Tab.Screen
        name="UploadTab"
        component={UploadScreen}
        options={{ tabBarLabel: 'Archivos' }}
      />
      <Tab.Screen
        name="BenchmarkTab"
        component={ConcurrencyBenchmarkScreen}
        options={{ tabBarLabel: 'Concurrencia' }}
      />
    </Tab.Navigator>
  );
};

export const AppNavigator = () => {
  const { isAuthenticated, loading } = useAuth();
  const { colors } = useTheme();

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          // Rutas de autenticación
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : (
          // Rutas de la aplicación autenticada
          <>
            <Stack.Screen name="MainTabs" component={MainTabs} />
            <Stack.Screen
              name="UserDetail"
              component={UserDetailScreen}
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name="UserForm"
              component={UserFormScreen}
              options={{ animation: 'slide_from_bottom' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
