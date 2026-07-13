// navigation/AdminStack.js
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import AdminLoginScreen from '../screens/admin/AdminLoginScreen';
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import UploadMatchScreen from '../screens/admin/UploadMatchScreen';
import ManageMatchesScreen from '../screens/admin/ManageMatchesScreen';

const Stack = createNativeStackNavigator();

const screenOptions = {
  headerStyle: { backgroundColor: '#0B0F19' },
  headerTintColor: '#F9FAFB',
  headerTitleStyle: { fontWeight: '800' },
  contentStyle: { backgroundColor: '#0B0F19' },
};

export default function AdminStack() {
  const { isAdmin } = useAuth();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      {isAdmin ? (
        <>
          <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} options={{ title: 'Admin' }} />
          <Stack.Screen name="UploadMatch" component={UploadMatchScreen} options={{ title: 'Upload Match' }} />
          <Stack.Screen name="ManageMatches" component={ManageMatchesScreen} options={{ title: 'Manage Matches' }} />
        </>
      ) : (
        <Stack.Screen name="AdminLogin" component={AdminLoginScreen} options={{ headerShown: false }} />
      )}
    </Stack.Navigator>
  );
}
