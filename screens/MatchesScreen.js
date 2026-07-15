import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import MatchCard from '../components/MatchCard';

const FILTERS = ['All', 'Live', 'Upcoming', 'Finished'];

export default function MatchesScreen({ navigation }) {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'matches'), (snapshot) => {
      setMatches(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, (error) => {
      console.error(error);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const filtered = matches.filter((m) => {
    if (filter === 'All') return true;
    if (filter === 'Live') return m.status === 'live';
    if (filter === 'Upcoming') return m.status === 'upcoming';
    if (filter === 'Finished') return m.status === 'finished';
    return true;
  });

  return (
    <View style={styles.container}>
      <View style={styles.filterRow}>
        {FILTERS.map((f) => (
          <TouchableOpacity key={f} style={[styles.filterChip, filter === f && styles.filterChipActive]} onPress={() => setFilter(f)}>
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {loading ? <View style={styles.center}><ActivityIndicator size="large" color="#22C55E" /></View> : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingVertical: 8 }}
          renderItem={({ item }) => (
            <MatchCard match={item} onPress={() => { if (item.status === 'live' && item.stream) navigation.navigate('StreamPlayer', { match: item }); }} />
          )}
          ListEmptyComponent={<View style={styles.center}><Text style={styles.emptyText}>No matches in this category</Text></View>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0F19' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 80 },
  emptyText: { color: '#F9FAFB', fontSize: 15 },
  filterRow: { flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: '#1F2937' },
  filterChipActive: { backgroundColor: '#22C55E' },
  filterText: { color: '#9CA3AF', fontSize: 13, fontWeight: '600' },
  filterTextActive: { color: '#0B0F19' },
});
