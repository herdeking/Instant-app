// navigation/BottomTabs.js
import React from 'react';
import { TouchableOpacity } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import WatchScreen from '../screens/WatchScreen';
import MatchesScreen from '../screens/MatchesScreen';
import NewsScreen from '../screens/NewsScreen';
import TableScreen from '../screens/TableScreen';

const Tab = createBottomTabNavigator();

const ICONS = {
  Watch: 'play-circle',
  Matches: 'football',
  News: 'newspaper',
  Table: 'list',
};

// Discreet admin entry point, tucked into the Table tab's header (not a visible 5th tab)
function AdminEntryButton({ navigation }) {
  return (
    <TouchableOpacity
      onPress={() => navigation.navigate('Admin')}
      style={{ paddingHorizontal: 16 }}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <Ionicons name="settings-outline" size={22} color="#6B7280" />
    </TouchableOpacity>
  );
}

export default function BottomTabs({ navigation: rootNavigation }) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerStyle: { backgroundColor: '#0B0F19' },
        headerTintColor: '#F9FAFB',
        headerTitleStyle: { fontWeight: '800' },
        tabBarStyle: { backgroundColor: '#0B0F19', borderTopColor: '#1F2937' },
        tabBarActiveTintColor: '#22C55E',
        tabBarInactiveTintColor: '#6B7280',
        tabBarIcon: ({ color, size, focused }) => (
          <Ionicons
            name={focused ? ICONS[route.name] : `${ICONS[route.name]}-outline`}
            size={size}
            color={color}
          />
        ),
      })}
    >
      <Tab.Screen name="Watch" component={WatchScreen} options={{ title: 'FullTime · Watch' }} />
      <Tab.Screen name="Matches" component={MatchesScreen} />
      <Tab.Screen name="News" component={NewsScreen} />
      <Tab.Screen
        name="Table"
        component={TableScreen}
        options={{
          headerRight: () => <AdminEntryButton navigation={rootNavigation} />,
        }}
      />
    </Tab.Navigator>
  );
}
