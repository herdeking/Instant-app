import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, Text, ActivityIndicator, RefreshControl, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { collection, onSnapshot } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import { db } from '../firebaseConfig';
import MatchCard from '../components/MatchCard';
import AdBanner from '../components/AdBanner';
import AdMobBanner from '../components/AdMobBanner';
import { showInterstitialThenContinue } from '../utils/interstitialAd';
import { useTheme } from '../theme';

const STATUS_FILTERS = ['All', 'Live', 'Upcoming', 'Finished'];
const DATE_FILTERS = ['Today', 'Tomorrow'];
const LEAGUE_FILTERS = ['Premier League', 'UCL', 'La Liga', 'Serie A', 'Bundesliga', 'World Cup'];

function parseMatchDate(dateStr, timeStr) {
  if (!dateStr) return null;
  const cleaned = dateStr.toString().replace(/[A-Z]{2,4}$/, '').replace(/\//g, '-').trim();
  const timePart = (timeStr || '00:00').toString().trim();
  // Combine as local time (no 'Z' suffix, so JS parses it in device timezone)
  const d = new Date(`${cleaned}T${timePart}:00`);
  return isNaN(d) ? null : d;
}

function formatMatchDate(dateStr, rawTimeStr) {
  const d = parseMatchDate(dateStr, rawTimeStr);
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
    const dA = parseMatchDate(a.date, a.time) || new Date(0);
    const dB = parseMatchDate(b.date, b.time) || new Date(0);
    return a.status === 'finished' ? dB - dA : dA - dB;
  });
}

function getStreamLink(match) {
  return match.stream || match.stream2 || match.stream3 || null;
}

export default function WatchScreen({ navigation }) {
  const { COLORS, mode, toggleTheme } = useTheme();
  const styles = getStyles(COLORS);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState(null);
  const [leagueFilter, setLeagueFilter] = useState(null);
  const [search, setSearch] = useState('');

  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'matches'),
      (snapshot) => {
        setFetchError(null);
        const data = snapshot.docs
          .map((doc) => {
            const d = { id: doc.id, ...doc.data() };
            d.formattedDate = formatMatchDate(d.date, d.time);
            return d;
          })
          .filter((m) => m.status !== 'draft' && m.published !== false);
        setMatches(sortMatches(data));
        setLoading(false);
        setRefreshing(false);
      },
      (error) => {
        setFetchError(error.message || 'Unknown error loading matches');
        setLoading(false);
        setRefreshing(false);
      }
    );
    return unsubscribe;
  }, []);

  const liveCount = matches.filter((m) => m.status === 'live').length;
  const upcomingCount = matches.filter((m) => m.status === 'upcoming').length;

  const filtered = matches.filter((m) => {
    // Status filter
    if (statusFilter !== 'All') {
      if (statusFilter === 'Live' && m.status !== 'live') return false;
      if (statusFilter === 'Upcoming' && m.status !== 'upcoming') return false;
      if (statusFilter === 'Finished' && m.status !== 'finished') return false;
    }

    // Date filter
    if (dateFilter) {
      const matchDate = parseMatchDate(m.date, m.time);
      const today = new Date();
      const tomorrow = new Date();
      tomorrow.setDate(today.getDate() + 1);
      if (dateFilter === 'Today' && matchDate?.toDateString() !== today.toDateString()) return false;
      if (dateFilter === 'Tomorrow' && matchDate?.toDateString() !== tomorrow.toDateString()) return false;
    }

    // League filter
    if (leagueFilter) {
      const comp = (m.comp || '').toLowerCase();
      const filter = leagueFilter.toLowerCase();
      if (!comp.includes(filter) && !filter.includes(comp)) return false;
    }

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      if (!((m.home || '').toLowerCase().includes(q)) && !((m.away || '').toLowerCase().includes(q))) return false;
    }

    return true;
  });

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={COLORS.gold} /></View>;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); setTimeout(() => setRefreshing(false), 1500); }} tintColor={COLORS.gold} />}
        ListHeaderComponent={
          <View>
            {/* Hero */}
            <View style={styles.hero}>
              <Text style={styles.heroEyebrow}>LIVE FOOTBALL STREAMING</Text>
              <AdMobBanner />
              <Text style={styles.heroTitle}>WATCH{'\n'}<Text style={styles.heroGold}>LIVE</Text>{'\n'}FOOTBALL</Text>
              <TouchableOpacity onPress={toggleTheme} style={[styles.themeToggle, { backgroundColor: COLORS.bgCard, borderColor: COLORS.border }]}>
                  <Ionicons name={mode === 'dark' ? 'sunny' : 'moon'} size={16} color={COLORS.gold} />
                </TouchableOpacity>
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

            {/* Ad Banner */}
            <AdBanner />
            <AdMobBanner />

            {/* Section header */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Matches</Text>
              <Text style={styles.matchCount}>{filtered.length} matches</Text>
            </View>

            {/* Search box */}
            <View style={styles.searchRow}>
              <Ionicons name="search" size={16} color={COLORS.textMuted} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search teams..."
                placeholderTextColor={COLORS.textMuted}
                value={search}
                onChangeText={setSearch}
              />
              {search ? (
                <TouchableOpacity onPress={() => setSearch('')}>
                  <Ionicons name="close" size={16} color={COLORS.textMuted} />
                </TouchableOpacity>
              ) : null}
            </View>

            {/* Status filters */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterContent}>
              {STATUS_FILTERS.map((f) => (
                <TouchableOpacity
                  key={f}
                  style={[styles.filterChip, statusFilter === f && styles.filterChipActive]}
                  onPress={() => setStatusFilter(f)}
                >
                  {f === 'Live' && <View style={styles.filterLiveDot} />}
                  <Text style={[styles.filterText, statusFilter === f && styles.filterTextActive]}>{f}</Text>
                </TouchableOpacity>
              ))}
              {/* Date filters */}
              {DATE_FILTERS.map((f) => (
                <TouchableOpacity
                  key={f}
                  style={[styles.filterChip, dateFilter === f && styles.dateChipActive]}
                  onPress={() => setDateFilter(dateFilter === f ? null : f)}
                >
                  <Text style={[styles.filterText, dateFilter === f && styles.dateTextActive]}>📅 {f}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* League filters */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterContent}>
              {LEAGUE_FILTERS.map((f) => (
                <TouchableOpacity
                  key={f}
                  style={[styles.filterChip, leagueFilter === f && styles.filterChipActive]}
                  onPress={() => setLeagueFilter(leagueFilter === f ? null : f)}
                >
                  <Text style={[styles.filterText, leagueFilter === f && styles.filterTextActive]}>{f}</Text>
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
                onPress={() => streamLink && showInterstitialThenContinue(() => navigation.navigate('StreamPlayer', { match: item }))}
              />
              {streamLink && (
                <TouchableOpacity
                  style={[styles.watchBtn,
                    item.status === 'live' ? styles.watchBtnLive :
                    item.status === 'finished' ? styles.watchBtnReplay :
                    styles.watchBtnUpcoming
                  ]}
                  onPress={() => showInterstitialThenContinue(() => navigation.navigate('StreamPlayer', { match: item }))}
                >
                  <Ionicons name="play" size={14} color={item.status === 'upcoming' ? COLORS.textPrimary : '#fff'} />
                  <Text style={item.status === 'upcoming' ? styles.watchBtnTextDark : styles.watchBtnText}>
                    {item.status === 'live' ? 'WATCH LIVE' : item.status === 'finished' ? 'WATCH REPLAY' : 'WATCH STREAM'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>{fetchError ? '⚠️' : '⚽'}</Text>
            <Text style={styles.emptyText}>{fetchError ? 'Failed to load matches' : 'No matches found'}</Text>
            <Text style={styles.emptySubtext}>{fetchError || 'Try a different filter'}</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

function getStyles(COLORS) {
  return StyleSheet.create({
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
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 6 },
  sectionTitle: { color: COLORS.textPrimary, fontSize: 18, fontWeight: '800' },
  matchCount: { color: COLORS.textMuted, fontSize: 13 },
    themeToggle: { position: 'absolute', top: 20, right: 20, width: 40, height: 40, borderRadius: 20, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  searchRow: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 12, marginVertical: 8, backgroundColor: COLORS.bgCard, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1, borderColor: COLORS.border, gap: 8 },
  searchInput: { flex: 1, color: COLORS.textPrimary, fontSize: 14 },
  filterContent: { paddingHorizontal: 12, paddingVertical: 6, gap: 8 },
  filterChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: COLORS.bgCard, borderWidth: 1, borderColor: COLORS.border, gap: 5 },
  filterChipActive: { backgroundColor: COLORS.gold, borderColor: COLORS.gold },
  dateChipActive: { backgroundColor: COLORS.bgCardAlt, borderColor: COLORS.gold },
  filterLiveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: COLORS.live },
  filterText: { color: COLORS.textSecondary, fontSize: 12, fontWeight: '700' },
  filterTextActive: { color: '#000' },
  dateTextActive: { color: COLORS.gold },
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
    watchBtnTextDark: { color: COLORS.textPrimary, fontWeight: '800', fontSize: 13, letterSpacing: 0.5 },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyText: { color: COLORS.textPrimary, fontSize: 16, fontWeight: '700' },
  emptySubtext: { color: COLORS.textMuted, fontSize: 13, marginTop: 6 },
});
}