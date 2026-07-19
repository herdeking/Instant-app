import React, { useEffect, useState, useRef } from 'react';
import { View, FlatList, StyleSheet, Text, ActivityIndicator } from 'react-native';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useTheme } from '../theme';
import { getMatchClock, getKickoffDate } from '../utils/matchClock';
import { getLiveFixture } from '../utils/apiSports';

const API_STATUS_LABELS = {
  '1H': (elapsed) => `${elapsed}'`,
  '2H': (elapsed) => `${elapsed}'`,
  HT: () => 'HT',
  FT: () => 'FT',
  AET: () => 'FT',
  PEN: () => 'FT',
};

export default function LivescoreScreen() {
  const { COLORS } = useTheme();
  const styles = getStyles(COLORS);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [liveData, setLiveData] = useState({}); // matchId -> api-sports fixture data
  const tickRef = useRef(0);
  const [, forceTick] = useState(0);
  const [debugMsg, setDebugMsg] = useState('not started');

  useEffect(() => {
    const q = query(collection(db, 'matches'), where('status', '==', 'live'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMatches(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // Poll api-sports.io for each live match every 60s (respects free-tier rate limits via cache)
  useEffect(() => {
    if (matches.length === 0) return;

    let cancelled = false;

    async function pollFixtures() {
      setDebugMsg(`polling ${matches.length} matches...`);
      const results = {};
      for (const m of matches) {
        try {
          const fixture = await getLiveFixture(m.home, m.away, m.date);
          if (fixture) results[m.id] = fixture;
          setDebugMsg(`${m.home} vs ${m.away}: ${fixture ? 'FOUND' : 'null (no fixture)'}`);
        } catch (err) {
          setDebugMsg(`ERROR for ${m.home}: ${err?.message || err}`);
        }
      }
      if (!cancelled) setLiveData(results);
    }

    pollFixtures();
    const interval = setInterval(pollFixtures, 60000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [matches.map((m) => m.id).join(',')]);

  // Local clock tick (for fallback display + auto-finish check) every 60s
  useEffect(() => {
    const interval = setInterval(() => {
      tickRef.current += 1;
      forceTick(tickRef.current);
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Auto-mark matches as finished once local clock hits 120min AND api doesn't say otherwise
  useEffect(() => {
    matches.forEach((m) => {
      const api = liveData[m.id];
      const kickoff = getKickoffDate(m.date, m.time);
      const clock = getMatchClock(kickoff);
      const apiSaysFinished = api?.status === 'FT' || api?.status === 'AET' || api?.status === 'PEN';
      if ((clock.isFullTime || apiSaysFinished) && m.status === 'live') {
        updateDoc(doc(db, 'matches', m.id), { status: 'finished' }).catch(() => {});
      }
    });
  }, [tickRef.current, matches, liveData]);

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color={COLORS.gold} /></View>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Livescore</Text>
        <Text style={styles.headerSubtitle}>{matches.length} live now</Text>
        <Text style={{ color: '#0f0', fontSize: 10 }}>{debugMsg}</Text>
      </View>
      <FlatList
        data={matches}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 12 }}
        renderItem={({ item }) => {
          const api = liveData[item.id];
          const kickoff = getKickoffDate(item.date, item.time);
          const localClock = getMatchClock(kickoff);

          // Prefer live API data; fall back to local clock + manual Firestore scores
          const clockDisplay = api?.status
            ? (API_STATUS_LABELS[api.status]?.(api.elapsed) || `${api.elapsed ?? ''}'`)
            : (localClock.display || 'LIVE');
          const homeScore = api?.homeScore ?? item.hscore ?? 0;
          const awayScore = api?.awayScore ?? item.ascore ?? 0;
          const isHalftime = api ? api.status === 'HT' : localClock.isHalftime;
          const usingLiveApi = !!api;

          return (
            <View style={styles.card}>
              <View style={styles.compRow}>
                <Text style={styles.comp}>{[item.comp, item.round].filter(Boolean).join(' · ').toUpperCase()}</Text>
                <View style={styles.badgeGroup}>
                  {usingLiveApi && <View style={styles.liveApiDot} />}
                  <View style={[styles.clockBadge, isHalftime && styles.clockBadgeHT]}>
                    <Text style={styles.clockText}>{clockDisplay}</Text>
                  </View>
                </View>
              </View>
              <View style={styles.teamsRow}>
                <View style={styles.team}>
                  <Text style={styles.teamName} numberOfLines={1}>{item.home}</Text>
                </View>
                <Text style={styles.score}>{homeScore} - {awayScore}</Text>
                <View style={styles.team}>
                  <Text style={[styles.teamName, styles.teamNameRight]} numberOfLines={1}>{item.away}</Text>
                </View>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>⚽</Text>
            <Text style={styles.emptyText}>No live matches right now</Text>
          </View>
        }
      />
    </View>
  );
}

function getStyles(COLORS) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.bg },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.bg },
    header: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
    headerTitle: { color: COLORS.textPrimary, fontSize: 22, fontWeight: '900' },
    headerSubtitle: { color: COLORS.live, fontSize: 13, fontWeight: '700', marginTop: 2 },
    card: { backgroundColor: COLORS.bgCard, borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: COLORS.border },
    compRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    comp: { color: COLORS.gold, fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
    badgeGroup: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    liveApiDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.success },
    clockBadge: { backgroundColor: COLORS.live, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
    clockBadgeHT: { backgroundColor: COLORS.textMuted },
    clockText: { color: '#fff', fontSize: 11, fontWeight: '800' },
    teamsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    team: { flex: 1 },
    teamName: { color: COLORS.textPrimary, fontSize: 15, fontWeight: '700' },
    teamNameRight: { textAlign: 'right' },
    score: { color: COLORS.textPrimary, fontSize: 24, fontWeight: '900', marginHorizontal: 16 },
    empty: { alignItems: 'center', paddingTop: 80 },
    emptyIcon: { fontSize: 48, marginBottom: 16 },
    emptyText: { color: COLORS.textMuted, fontSize: 15, fontWeight: '600' },
  });
}
