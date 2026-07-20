import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import MatchCard from '../components/MatchCard';
import { useTheme } from '../theme';

const FILTERS = ['All', 'Live', 'Upcoming', 'Finished'];

export default function MatchesScreen({ navigation }) {
  const { COLORS } = useTheme();
  const styles = getStyles(COLORS);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'matches'),
      (snapshot) => {
        setFetchError(null);
        const data = snapshot.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .filter((m) => m.status !== 'draft' && m.published !== false);
        setMatches(data);
        setLoading(false);
      },
      (error) => {
        setFetchError(error.message || 'Unknown error loading matches');
        setLoading(false);
      }
    );
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
      {loading ? <View style={styles.center}><ActivityIndicator size="large" color={COLORS.gold} /></View> : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingVertical: 8 }}
          renderItem={({ item }) => (
            <MatchCard
              match={item}
              onPress={() => {
                const hasStream = item.stream || item.stream2 || item.stream3 || (item.streams && item.streams.length > 0);
                if (hasStream) navigation.navigate('StreamPlayer', { match: item });
              }}
            />
          )}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.emptyText}>{fetchError ? 'Failed to load matches' : 'No matches in this category'}</Text>
              {fetchError && <Text style={styles.emptySubtext}>{fetchError}</Text>}
            </View>
          }
        />
      )}
    </View>
  );
}

function getStyles(COLORS) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.bg },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 80 },
    emptyText: { color: COLORS.textPrimary, fontSize: 15 },
    emptySubtext: { color: COLORS.textMuted, fontSize: 12, marginTop: 6, textAlign: 'center', paddingHorizontal: 20 },
    filterRow: { flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
    filterChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: COLORS.bgCardAlt },
    filterChipActive: { backgroundColor: COLORS.gold },
    filterText: { color: COLORS.textMuted, fontSize: 13, fontWeight: '600' },
    filterTextActive: { color: '#000' },
  });
}
