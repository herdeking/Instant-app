import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './context/AuthContext';
import BottomTabs from './navigation/BottomTabs';
import AdminStack from './navigation/AdminStack';
import StreamPlayerScreen from './screens/StreamPlayerScreen';
import { COLORS } from './theme';

const RootStack = createNativeStackNavigator();

const navTheme = {
  dark: true,
  colors: {
    primary: COLORS.gold,
    background: COLORS.bg,
    card: COLORS.bgTab,
    text: COLORS.textPrimary,
    border: COLORS.border,
    notification: COLORS.gold,
  },
};

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer theme={navTheme}>
        <StatusBar style="light" />
        <RootStack.Navigator screenOptions={{ headerShown: false }}>
          <RootStack.Screen name="MainTabs" component={BottomTabs} />
          <RootStack.Screen name="StreamPlayer" component={StreamPlayerScreen} options={{ headerShown: true, title: '', presentation: 'fullScreenModal', headerStyle: { backgroundColor: COLORS.bg }, headerTintColor: COLORS.textPrimary }} />
          <RootStack.Screen name="Admin" component={AdminStack} options={{ presentation: 'modal' }} />
        </RootStack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
}
