import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator, Text, TouchableOpacity, ScrollView } from 'react-native';
import StandingsRow from '../components/StandingsRow';
import { COLORS } from '../theme';

const LEAGUES = [
  { id: 'WC', name: 'World Cup' },
  { id: 'PL', name: 'Premier League' },
  { id: 'PD', name: 'La Liga' },
  { id: 'BL1', name: 'Bundesliga' },
  { id: 'SA', name: 'Serie A' },
  { id: 'FL1', name: 'Ligue 1' },
  { id: 'CL', name: 'Champions League' },
];

export default function TableScreen() {
  const [standings, setStandings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLeague, setSelectedLeague] = useState('WC');
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`https://api.football-data.org/v4/competitions/${selectedLeague}/standings?season=2025`, {
      headers: { 'X-Auth-Token': 'ae94b936902e463b9cd2ca4963dfdb09' },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.errorCode) { setError(data.message || 'Not available'); setLoading(false); return; }
        const table = data?.standings?.[0]?.table || [];
        setStandings(table.map((entry) => ({
          id: String(entry.position),
          position: entry.position,
          teamName: entry.team.shortName || entry.team.name,
          logo: entry.team.crest,
          played: entry.playedGames,
          goalDifference: entry.goalDifference,
          points: entry.points,
        })));
        setLoading(false);
      })
      .catch(() => { setError('Failed to load standings'); setLoading(false); });
  }, [selectedLeague]);

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.leagueTabs} contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 10, gap: 8 }}>
        {LEAGUES.map((l) => (
          <TouchableOpacity key={l.id} style={[styles.leagueTab, selectedLeague === l.id && styles.leagueTabActive]} onPress={() => setSelectedLeague(l.id)}>
            <Text style={[styles.leagueText, selectedLeague === l.id && styles.leagueTextActive]}>{l.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <StandingsRow isHeader />
      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color={COLORS.gold} /></View>
      ) : error ? (
        <View style={styles.center}><Text style={styles.errorText}>{error}</Text></View>
      ) : (
        <FlatList
          data={standings}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <StandingsRow team={item} />}
          ListEmptyComponent={<View style={styles.center}><Text style={styles.errorText}>No data available</Text></View>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 60 },
  errorText: { color: COLORS.textSecondary, fontSize: 14 },
  leagueTabs: { maxHeight: 52, flexGrow: 0 },
  leagueTab: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: COLORS.bgCard, borderWidth: 1, borderColor: COLORS.border },
  leagueTabActive: { backgroundColor: COLORS.gold, borderColor: COLORS.gold },
  leagueText: { color: COLORS.textSecondary, fontSize: 12, fontWeight: '700' },
  leagueTextActive: { color: '#000' },
});
