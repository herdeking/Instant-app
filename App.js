// App.js
import React from 'react';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './context/AuthContext';
import BottomTabs from './navigation/BottomTabs';
import AdminStack from './navigation/AdminStack';
import StreamPlayerScreen from './screens/StreamPlayerScreen';

const RootStack = createNativeStackNavigator();

const navTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: '#0B0F19',
    card: '#0B0F19',
    primary: '#22C55E',
  },
};

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer theme={navTheme}>
        <StatusBar style="light" />
        <RootStack.Navigator screenOptions={{ headerShown: false }}>
          <RootStack.Screen name="MainTabs" component={BottomTabs} />
          <RootStack.Screen
            name="StreamPlayer"
            component={StreamPlayerScreen}
            options={{ headerShown: true, title: '', presentation: 'fullScreenModal' }}
          />
          <RootStack.Screen
            name="Admin"
            component={AdminStack}
            options={{ presentation: 'modal' }}
          />
        </RootStack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
}
