// screens/admin/ManageMatchesScreen.js
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Switch,
} from 'react-native';
import { collection, query, orderBy, onSnapshot, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import { db } from '../../firebaseConfig';

export default function ManageMatchesScreen() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'matches'), orderBy('kickoffTime', 'asc'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setMatches(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
      (error) => {
        console.error(error);
        setLoading(false);
      }
    );
    return unsubscribe;
  }, []);

  const toggleLive = async (match) => {
    try {
      await updateDoc(doc(db, 'matches', match.id), {
        isLive: !match.isLive,
        status: !match.isLive ? 'live' : 'upcoming',
      });
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Could not update match status.');
    }
  };

  const handleDelete = (match) => {
    Alert.alert(
      'Delete match',
      `Remove ${match.homeTeam} vs ${match.awayTeam}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'matches', match.id));
            } catch (e) {
              console.error(e);
              Alert.alert('Error', 'Could not delete match.');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#22C55E" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={matches}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 12 }}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={styles.info}>
              <Text style={styles.teams}>{item.homeTeam} vs {item.awayTeam}</Text>
              <Text style={styles.meta}>{item.competition} · {item.kickoffTime}</Text>
            </View>
            <View style={styles.actions}>
              <View style={styles.liveToggle}>
                <Text style={styles.liveLabel}>Live</Text>
                <Switch
                  value={!!item.isLive}
                  onValueChange={() => toggleLive(item)}
                  trackColor={{ false: '#374151', true: '#22C55E' }}
                  thumbColor="#F9FAFB"
                />
              </View>
              <TouchableOpacity onPress={() => handleDelete(item)} style={styles.deleteBtn}>
                <Ionicons name="trash-outline" size={20} color="#F87171" />
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={styles.emptyText}>No matches uploaded yet</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0F19' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 80 },
  emptyText: { color: '#F9FAFB', fontSize: 15 },
  row: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  info: { marginBottom: 10 },
  teams: { color: '#F9FAFB', fontSize: 15, fontWeight: '700' },
  meta: { color: '#9CA3AF', fontSize: 12, marginTop: 2 },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  liveToggle: { flexDirection: 'row', alignItems: 'center' },
  liveLabel: { color: '#D1D5DB', fontSize: 13, marginRight: 8 },
  deleteBtn: { padding: 6 },
});
