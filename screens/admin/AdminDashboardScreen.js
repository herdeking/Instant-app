// screens/admin/AdminDashboardScreen.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';

export default function AdminDashboardScreen({ navigation }) {
  const { logout, user } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.welcome}>Welcome back{user?.email ? `, ${user.email.split('@')[0]}` : ''}</Text>

      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('UploadMatch')}
      >
        <Ionicons name="add-circle-outline" size={28} color="#22C55E" />
        <View style={styles.cardText}>
          <Text style={styles.cardTitle}>Upload Match</Text>
          <Text style={styles.cardSubtitle}>Add a new match and streaming link</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('ManageMatches')}
      >
        <Ionicons name="list-outline" size={28} color="#22C55E" />
        <View style={styles.cardText}>
          <Text style={styles.cardTitle}>Manage Matches</Text>
          <Text style={styles.cardSubtitle}>Edit or remove existing matches</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Ionicons name="log-out-outline" size={20} color="#F87171" />
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0F19', padding: 20 },
  welcome: { color: '#F9FAFB', fontSize: 20, fontWeight: '700', marginBottom: 24, marginTop: 8 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
  },
  cardText: { marginLeft: 14, flex: 1 },
  cardTitle: { color: '#F9FAFB', fontSize: 16, fontWeight: '700' },
  cardSubtitle: { color: '#9CA3AF', fontSize: 12, marginTop: 2 },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 30,
    padding: 12,
  },
  logoutText: { color: '#F87171', fontSize: 14, fontWeight: '700', marginLeft: 6 },
});
