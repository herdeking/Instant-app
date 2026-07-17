import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import WatchScreen from '../screens/WatchScreen';
import MatchesScreen from '../screens/MatchesScreen';
import NewsScreen from '../screens/NewsScreen';
import TableScreen from '../screens/TableScreen';
import LivescoreScreen from '../screens/LivescoreScreen';
import { COLORS } from '../theme';

const Tab = createBottomTabNavigator();
const ICONS = { Livestream: 'play-circle', Matches: 'football', Livescore: 'pulse', News: 'newspaper', Table: 'podium' };

export default function BottomTabs({ navigation: rootNavigation }) {
  const insets = useSafeAreaInsets();

  function AdminBtn() {
    return (
      <TouchableOpacity
        onPress={() => rootNavigation.navigate('Admin')}
        style={styles.adminBtn}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="settings-outline" size={20} color={COLORS.textMuted} />
      </TouchableOpacity>
    );
  }

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerStyle: { backgroundColor: COLORS.bg, borderBottomWidth: 0, elevation: 0, shadowOpacity: 0 },
        headerTintColor: COLORS.textPrimary,
        headerTitleStyle: { fontWeight: '800', fontSize: 20, letterSpacing: 0.5 },
        tabBarStyle: {
          backgroundColor: COLORS.bgTab,
          borderTopColor: COLORS.border,
          borderTopWidth: 1,
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom + 4,
          paddingTop: 8,
        },
        tabBarActiveTintColor: COLORS.gold,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '700', letterSpacing: 0.3 },
        tabBarIcon: ({ color, size, focused }) => (
          <Ionicons name={focused ? ICONS[route.name] : `${ICONS[route.name]}-outline`} size={size} color={color} />
        ),
      })}
    >
      <Tab.Screen name="Livestream" component={WatchScreen} options={{ title: 'Livestream', headerShown: false }} />
      <Tab.Screen name="Matches" component={MatchesScreen} />
        <Tab.Screen name="Livescore" component={LivescoreScreen} />
      <Tab.Screen name="News" component={NewsScreen} />
      <Tab.Screen name="Table" component={TableScreen} options={{ headerRight: () => <AdminBtn /> }} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({ adminBtn: { paddingHorizontal: 16 } });
