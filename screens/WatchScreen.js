import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, Text, ActivityIndicator, RefreshControl, TouchableOpacity, ImageBackground } from 'react-native';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import { db } from '../firebaseConfig';
import MatchCard from '../components/MatchCard';
import { COLORS } from '../theme';

function HeroBanner({ liveCount }) {
  return (
    <View style={styles.hero}>
      <Text style={styles.heroEyebrow}>⚽ LIVE FOOTBALL STREAMING</Text>
      <Text style={styles.heroTitle}>WATCH{'\n'}<Text style={styles.heroGold}>LIVE</Text>{'\n'}FOOTBALL</Text>
      <View style={styles.liveCountBadge}>
        <View style={styles.liveDot} />
        <Text style={styles.liveCountText}>{liveCount} Live</Text>
      </View>
    </View>
  );
}

export default function WatchScreen({ navigation }) {
  const [liveMatches, setLiveMatches] = useState([]);
  const [allMatches, setAllMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'matches'), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setAllMatches(data);
      setLiveMatches(data.filter((m) => m.status === 'live'));
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
      <FlatList
        data={allMatches}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => setRefreshing(true)} tintColor={COLORS.gold} />}
        ListHeaderComponent={<HeroBanner liveCount={liveMatches.length} />}
        renderItem={({ item }) => (
          <View style={styles.matchWrapper}>
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
                  {item.status === 'live' ? 'WATCH LIVE' : 'WATCH REPLAY'}
                </Text>
              </TouchableOpacity>
            ) : null}
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>⚽</Text>
            <Text style={styles.emptyText}>No matches available</Text>
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
  hero: {
    backgroundColor: '#0A0E1A',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 28,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  heroEyebrow: {
    color: COLORS.gold,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 10,
  },
  heroTitle: {
    color: COLORS.textPrimary,
    fontSize: 42,
    fontWeight: '900',
    lineHeight: 46,
    letterSpacing: 1,
    marginBottom: 16,
  },
  heroGold: { color: COLORS.gold },
  liveCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgCard,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.live },
  liveCountText: { color: COLORS.textPrimary, fontSize: 13, fontWeight: '700' },
  matchWrapper: { marginBottom: 4 },
  watchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 12,
    marginTop: -2,
    marginBottom: 8,
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
  },
  watchBtnLive: { backgroundColor: COLORS.live },
  watchBtnReplay: { backgroundColor: '#1D4ED8' },
  watchBtnText: { color: '#fff', fontWeight: '800', fontSize: 13, letterSpacing: 1 },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyText: { color: COLORS.textPrimary, fontSize: 16, fontWeight: '700' },
  emptySubtext: { color: COLORS.textMuted, fontSize: 13, marginTop: 6 },
});
