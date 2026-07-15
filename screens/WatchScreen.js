import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, Text, ActivityIndicator, RefreshControl } from 'react-native';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import MatchCard from '../components/MatchCard';
import { COLORS } from '../theme';

export default function WatchScreen({ navigation }) {
  const [liveMatches, setLiveMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'matches'), where('status', '==', 'live'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setLiveMatches(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
      setRefreshing(false);
    }, (error) => {
      console.error(error);
      setLoading(false);
      setRefreshing(false);
    });
    return unsubscribe;
  }, []);

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={COLORS.gold} /></View>;

  return (
    <View style={styles.container}>
      {liveMatches.length > 0 && (
        <View style={styles.liveHeader}>
          <View style={styles.liveDot} />
          <Text style={styles.liveHeaderText}>{liveMatches.length} MATCH{liveMatches.length > 1 ? 'ES' : ''} LIVE NOW</Text>
        </View>
      )}
      <FlatList
        data={liveMatches}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingVertical: 12 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => setRefreshing(true)} tintColor={COLORS.gold} />}
        renderItem={({ item }) => (
          <MatchCard match={item} onPress={() => navigation.navigate('StreamPlayer', { match: item })} />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>⚽</Text>
            <Text style={styles.emptyText}>No live matches right now</Text>
            <Text style={styles.emptySubtext}>Check back closer to kickoff</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.bg },
  liveHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.live },
  liveHeaderText: { color: COLORS.live, fontSize: 11, fontWeight: '800', letterSpacing: 1.5 },
  empty: { flex: 1, alignItems: 'center', paddingTop: 100 },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyText: { color: COLORS.textPrimary, fontSize: 16, fontWeight: '700' },
  emptySubtext: { color: COLORS.textMuted, fontSize: 13, marginTop: 6 },
});
