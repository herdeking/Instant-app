import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, Text, ActivityIndicator, RefreshControl, TouchableOpacity, ScrollView } from 'react-native';
import { collection, onSnapshot } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import { db } from '../firebaseConfig';
import MatchCard from '../components/MatchCard';
import AdBanner from '../components/AdBanner';
import AdBanner from '../components/AdBanner';
import { COLORS } from '../theme';

const FILTERS = ['All', 'Live', 'Upcoming', 'Finished'];

function parseMatchDate(dateStr) {
  if (!dateStr) return null;
  // Remove timezone labels like WAT, GMT, UTC, etc.
  const cleaned = dateStr.toString().replace(/[A-Z]{2,4}$/, '').replace(/\//g, '-').trim();
  const d = new Date(cleaned);
  return isNaN(d) ? null : d;
}

function formatMatchDate(dateStr) {
  const d = parseMatchDate(dateStr);
  if (!d) return dateStr || '';
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);
  const isToday = d.toDateString() === today.toDateString();
  const isTomorrow = d.toDateString() === tomorrow.toDateString();
  const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dateLabel = isToday ? 'Today' : isTomorrow ? 'Tomorrow' : d.toLocaleDateString([], { day: 'numeric', month: 'short' });
  return `${dateLabel} · ${timeStr}`;
}

function sortMatches(matches) {
  const order = { live: 0, upcoming: 1, finished: 2, draft: 3 };
  return [...matches].sort((a, b) => {
    const statusDiff = (order[a.status] ?? 1) - (order[b.status] ?? 1);
    if (statusDiff !== 0) return statusDiff;
    const dA = parseMatchDate(a.date) || new Date(0);
    const dB = parseMatchDate(b.date) || new Date(0);
    return a.status === 'finished' ? dB - dA : dA - dB;
  });
}

function getStreamLink(match) {
  return match.stream || match.stream2 || match.stream3 || null;
}

export default function WatchScreen({ navigation }) {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'matches'), (snapshot) => {
      const data = snapshot.docs
        .map((doc) => {
          const d = { id: doc.id, ...doc.data() };
          d.formattedDate = formatMatchDate(d.date);
          return d;
        })
        .filter((m) => m.status !== 'draft'); // hide draft matches
      setMatches(sortMatches(data));
      setLoading(false);
      setRefreshing(false);
    });
    return unsubscribe;
  }, []);

  const liveCount = matches.filter((m) => m.status === 'live').length;
  const upcomingCount = matches.filter((m) => m.status === 'upcoming').length;

  const filtered = matches.filter((m) => {
    if (filter === 'All') return true;
    if (filter === 'Live') return m.status === 'live';
    if (filter === 'Upcoming') return m.status === 'upcoming';
    return m.status === 'finished';
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
            <View style={styles.hero}>
              <Text style={styles.heroEyebrow}>LIVE FOOTBALL STREAMING</Text>
              <Text style={styles.heroTitle}>WATCH{'\n'}<Text style={styles.heroGold}>LIVE</Text>{'\n'}FOOTBALL</Text>
              <View style={styles.badgeRow}>
                <View style={styles.liveCountBadge}>
                  <View style={[styles.liveDot, liveCount > 0 && styles.liveDotActive]} />
                  <Text style={styles.liveCountText}>{liveCount} Live</Text>
                </View>
                {upcomingCount > 0 && (
                  <View style={styles.upcomingBadge}>
                    <Text style={styles.upcomingText}>{upcomingCount} Upcoming</Text>
                  </View>
                )}
              </View>
            </View>
            <AdBanner />

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Matches</Text>
              <Text style={styles.matchCount}>{filtered.length} matches</Text>
            </View>

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
        renderItem={({ item }) => {
          const streamLink = getStreamLink(item);
          return (
            <View style={styles.matchBlock}>
              <View style={styles.matchDateRow}>
                <Text style={styles.matchComp}>
                  {[item.comp, item.round].filter(Boolean).join(' · ').toUpperCase()}
                </Text>
                <Text style={styles.matchDate}>{item.formattedDate}</Text>
                {item.status === 'live' && (
                  <View style={styles.liveTag}>
                    <Text style={styles.liveTagText}>{item.minute ? `LIVE ${item.minute}'` : 'LIVE'}</Text>
                  </View>
                )}
              </View>
              <MatchCard
                match={item}
                onPress={() => streamLink && navigation.navigate('StreamPlayer', { match: item })}
              />
              {streamLink && (
                <TouchableOpacity
                  style={[styles.watchBtn,
                    item.status === 'live' ? styles.watchBtnLive :
                    item.status === 'finished' ? styles.watchBtnReplay :
                    styles.watchBtnUpcoming
                  ]}
                  onPress={() => navigation.navigate('StreamPlayer', { match: item })}
                >
                  <Ionicons name="play" size={14} color="#fff" />
                  <Text style={styles.watchBtnText}>
                    {item.status === 'live' ? 'WATCH LIVE' : item.status === 'finished' ? 'WATCH REPLAY' : 'WATCH STREAM'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>⚽</Text>
            <Text style={styles.emptyText}>No {filter.toLowerCase()} matches</Text>
            <Text style={styles.emptySubtext}>Check back later</Text>
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
  badgeRow: { flexDirection: 'row', gap: 10 },
  liveCountBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.bgCard, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, gap: 6, borderWidth: 1, borderColor: COLORS.border },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.textMuted },
  liveDotActive: { backgroundColor: COLORS.live },
  liveCountText: { color: COLORS.textPrimary, fontSize: 13, fontWeight: '700' },
  upcomingBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.bgCard, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: COLORS.border },
  upcomingText: { color: COLORS.gold, fontSize: 13, fontWeight: '700' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 20, paddingBottom: 6 },
  sectionTitle: { color: COLORS.textPrimary, fontSize: 18, fontWeight: '800' },
  matchCount: { color: COLORS.textMuted, fontSize: 13 },
  filterContent: { paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
  filterChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20, backgroundColor: COLORS.bgCard, borderWidth: 1, borderColor: COLORS.border, gap: 5 },
  filterChipActive: { backgroundColor: COLORS.gold, borderColor: COLORS.gold },
  filterLiveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: COLORS.live },
  filterText: { color: COLORS.textSecondary, fontSize: 13, fontWeight: '700' },
  filterTextActive: { color: '#000' },
  matchBlock: { marginBottom: 4 },
  matchDateRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4, gap: 8 },
  matchComp: { color: COLORS.gold, fontSize: 10, fontWeight: '800', letterSpacing: 1, flex: 1 },
  matchDate: { color: COLORS.textSecondary, fontSize: 11, fontWeight: '600' },
  liveTag: { backgroundColor: COLORS.live, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  liveTagText: { color: '#fff', fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
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
