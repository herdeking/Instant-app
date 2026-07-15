import React, { useEffect, useState } from 'react';
import {
  View, ScrollView, FlatList, StyleSheet, Text, ActivityIndicator,
  RefreshControl, TouchableOpacity,
} from 'react-native';
import { collection, onSnapshot } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import { db } from '../firebaseConfig';
import MatchCard from '../components/MatchCard';
import { COLORS } from '../theme';

const FILTERS = ['All', 'Live', 'Upcoming', 'Finished'];
const DATE_FILTERS = ['All', 'Today', 'Tomorrow'];

function getToday() {
  return new Date().toISOString().slice(0, 10);
}
function getTomorrow() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

export default function WatchScreen({ navigation }) {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('All');

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'matches'), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setMatches(data);
      setLoading(false);
      setRefreshing(false);
    }, (error) => {
      console.error(error);
      setLoading(false);
      setRefreshing(false);
    });
    return unsubscribe;
  }, []);

  const liveCount = matches.filter((m) => m.status === 'live').length;

  const filtered = matches.filter((m) => {
    const statusMatch =
      filter === 'All' ? true :
      filter === 'Live' ? m.status === 'live' :
      filter === 'Upcoming' ? m.status === 'upcoming' :
      m.status === 'finished';

    const today = getToday();
    const tomorrow = getTomorrow();
    const matchDate = (m.date || '').slice(0, 10);
    const dateMatch =
      dateFilter === 'All' ? true :
      dateFilter === 'Today' ? matchDate === today :
      matchDate === tomorrow;

    return statusMatch && dateMatch;
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

            {/* Matches header */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Matches</Text>
              <Text style={styles.matchCount}>{filtered.length} matches</Text>
            </View>

            {/* Status filters */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={styles.filterContent}>
              {FILTERS.map((f) => (
                <TouchableOpacity key={f} style={[styles.filterChip, filter === f && styles.filterChipActive]} onPress={() => setFilter(f)}>
                  {f === 'Live' && <View style={styles.filterLiveDot} />}
                  <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>{f}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Date filters */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={styles.filterContent}>
              {DATE_FILTERS.map((f) => (
                <TouchableOpacity key={f} style={[styles.dateChip, dateFilter === f && styles.dateChipActive]} onPress={() => setDateFilter(f)}>
                  <Text style={[styles.dateText, dateFilter === f && styles.dateTextActive]}>{f === 'Today' ? '📅 Today' : f === 'Tomorrow' ? '📅 Tomorrow' : f}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        }
        renderItem={({ item }) => (
          <View>
            <MatchCard
              match={item}
              onPress={() => item.stream && navigation.navigate('StreamPlayer', { match: item })}
            />
            {item.stream ? (
              <TouchableOpacity
                style={[styles.watchBtn, item.status === 'live' ? styles.watchBtnLive : styles.watchBtnReplay]}
                onPress={() => navigation.navigate('StreamPlayer', { match: item })}
              >
                <Ionicons name="play" size={14} color="#fff" />
                <Text style={styles.watchBtnText}>
                  {item.status === 'live' ? '▶ WATCH NOW' : '▶ WATCH REPLAY'}
                </Text>
              </TouchableOpacity>
            ) : null}
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
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 20, paddingBottom: 10 },
  sectionTitle: { color: COLORS.textPrimary, fontSize: 18, fontWeight: '800' },
  matchCount: { color: COLORS.textMuted, fontSize: 13 },
  filterScroll: { marginBottom: 4 },
  filterContent: { paddingHorizontal: 12, paddingVertical: 6, gap: 8 },
  filterChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20, backgroundColor: COLORS.bgCard, borderWidth: 1, borderColor: COLORS.border, gap: 5 },
  filterChipActive: { backgroundColor: COLORS.gold, borderColor: COLORS.gold },
  filterLiveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: COLORS.live },
  filterText: { color: COLORS.textSecondary, fontSize: 13, fontWeight: '700' },
  filterTextActive: { color: '#000' },
  dateChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: COLORS.bgCard, borderWidth: 1, borderColor: COLORS.border },
  dateChipActive: { backgroundColor: COLORS.bgCardAlt, borderColor: COLORS.gold },
  dateText: { color: COLORS.textMuted, fontSize: 12, fontWeight: '600' },
  dateTextActive: { color: COLORS.gold },
  watchBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginHorizontal: 12, marginTop: -4, marginBottom: 10, paddingVertical: 12, borderRadius: 10, gap: 8 },
  watchBtnLive: { backgroundColor: COLORS.live },
  watchBtnReplay: { backgroundColor: '#1D4ED8' },
  watchBtnText: { color: '#fff', fontWeight: '800', fontSize: 13, letterSpacing: 0.5 },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyText: { color: COLORS.textPrimary, fontSize: 16, fontWeight: '700' },
  emptySubtext: { color: COLORS.textMuted, fontSize: 13, marginTop: 6 },
});
