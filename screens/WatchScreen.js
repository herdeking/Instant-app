import React, { useEffect, useState } from 'react';
import {
  View, FlatList, StyleSheet, Text, ActivityIndicator,
  RefreshControl, TouchableOpacity, ScrollView,
} from 'react-native';
import { collection, onSnapshot } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import { db } from '../firebaseConfig';
import MatchCard from '../components/MatchCard';
import { COLORS } from '../theme';

const FILTERS = ['All', 'Live', 'Upcoming', 'Finished'];

function autoStatus(match) {
  // If admin manually set live, keep it
  if (match.status === 'live') return 'live';

  const now = new Date();
  const matchDate = new Date(match.date);

  if (isNaN(matchDate)) return match.status || 'upcoming';

  const diffMs = now - matchDate;
  const diffMins = diffMs / 60000;

  if (diffMins < 0) return 'upcoming';           // future
  if (diffMins >= 0 && diffMins < 105) return 'live';  // 0-105 mins = live
  return 'finished';                              // past 105 mins
}

function sortMatches(matches) {
  return [...matches].sort((a, b) => {
    const dateA = new Date(a.date || 0);
    const dateB = new Date(b.date || 0);
    return dateA - dateB;
  });
}

export default function WatchScreen({ navigation }) {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'matches'), (snapshot) => {
      const data = snapshot.docs.map((doc) => {
        const d = { id: doc.id, ...doc.data() };
        d.computedStatus = autoStatus(d);
        return d;
      });
      setMatches(sortMatches(data));
      setLoading(false);
      setRefreshing(false);
    });
    return unsubscribe;
  }, []);

  // Re-compute status every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setMatches((prev) =>
        sortMatches(prev.map((m) => ({ ...m, computedStatus: autoStatus(m) })))
      );
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const liveCount = matches.filter((m) => m.computedStatus === 'live').length;

  const filtered = matches.filter((m) => {
    if (filter === 'All') return true;
    if (filter === 'Live') return m.computedStatus === 'live';
    if (filter === 'Upcoming') return m.computedStatus === 'upcoming';
    if (filter === 'Finished') return m.computedStatus === 'finished';
    return true;
  });

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={COLORS.gold} /></View>;

  return (
    <View style={styles.container}>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => setRefreshing(true)} tintColor={COLORS.gold} />}
        ListHeaderComponent={
          <View>
            {/* Hero */}
            <View style={styles.hero}>
              <Text style={styles.heroEyebrow}>LIVE FOOTBALL STREAMING</Text>
              <Text style={styles.heroTitle}>WATCH{'\n'}<Text style={styles.heroGold}>LIVE</Text>{'\n'}FOOTBALL</Text>
              <View style={styles.liveCountBadge}>
                <View style={[styles.liveDot, liveCount > 0 && styles.liveDotActive]} />
                <Text style={styles.liveCountText}>{liveCount} Live</Text>
              </View>
            </View>

            {/* Section header */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Matches</Text>
              <Text style={styles.matchCount}>{filtered.length} matches</Text>
            </View>

            {/* Filters */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterContent}>
              {FILTERS.map((f) => (
                <TouchableOpacity key={f} style={[styles.filterChip, filter === f && styles.filterChipActive]} onPress={() => setFilter(f)}>
                  {f === 'Live' && <View style={styles.filterLiveDot} />}
                  <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>{f}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        }
        renderItem={({ item }) => (
          <View>
            <MatchCard
              match={{ ...item, status: item.computedStatus }}
              onPress={() => item.stream && navigation.navigate('StreamPlayer', { match: item })}
            />
            {item.stream && (
              <TouchableOpacity
                style={[styles.watchBtn, item.computedStatus === 'live' ? styles.watchBtnLive : item.computedStatus === 'finished' ? styles.watchBtnReplay : styles.watchBtnUpcoming]}
                onPress={() => navigation.navigate('StreamPlayer', { match: item })}
              >
                <Ionicons name="play" size={14} color="#fff" />
                <Text style={styles.watchBtnText}>
                  {item.computedStatus === 'live' ? '▶ WATCH LIVE' : item.computedStatus === 'finished' ? '▶ WATCH REPLAY' : '▶ SET REMINDER'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>⚽</Text>
            <Text style={styles.emptyText}>No matches found</Text>
            <Text style={styles.emptySubtext}>Try a different filter</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.bg },
  hero: { backgroundColor: COLORS.bg, paddingHorizontal: 20, paddingTop: 20, paddingBottom: 24, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  heroEyebrow: { color: COLORS.gold, fontSize: 10, fontWeight: '700', letterSpacing: 2, marginBottom: 10 },
  heroTitle: { color: COLORS.textPrimary, fontSize: 40, fontWeight: '900', lineHeight: 44, letterSpacing: 1, marginBottom: 16 },
  heroGold: { color: COLORS.gold },
  liveCountBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.bgCard, alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, gap: 6, borderWidth: 1, borderColor: COLORS.border },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.textMuted },
  liveDotActive: { backgroundColor: COLORS.live },
  liveCountText: { color: COLORS.textPrimary, fontSize: 13, fontWeight: '700' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 20, paddingBottom: 6 },
  sectionTitle: { color: COLORS.textPrimary, fontSize: 18, fontWeight: '800' },
  matchCount: { color: COLORS.textMuted, fontSize: 13 },
  filterContent: { paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
  filterChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20, backgroundColor: COLORS.bgCard, borderWidth: 1, borderColor: COLORS.border, gap: 5 },
  filterChipActive: { backgroundColor: COLORS.gold, borderColor: COLORS.gold },
  filterLiveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: COLORS.live },
  filterText: { color: COLORS.textSecondary, fontSize: 13, fontWeight: '700' },
  filterTextActive: { color: '#000' },
  watchBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginHorizontal: 12, marginTop: -4, marginBottom: 10, paddingVertical: 12, borderRadius: 10, gap: 8 },
  watchBtnLive: { backgroundColor: COLORS.live },
  watchBtnReplay: { backgroundColor: '#1D4ED8' },
  watchBtnUpcoming: { backgroundColor: COLORS.bgCardAlt, borderWidth: 1, borderColor: COLORS.border },
  watchBtnText: { color: '#fff', fontWeight: '800', fontSize: 13, letterSpacing: 0.5 },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyText: { color: COLORS.textPrimary, fontSize: 16, fontWeight: '700' },
  emptySubtext: { color: COLORS.textMuted, fontSize: 13, marginTop: 6 },
});
