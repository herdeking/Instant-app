import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import StandingsRow from '../components/StandingsRow';

const LEAGUES = [
  { id: 'PL', name: 'Premier League' },
  { id: 'PD', name: 'La Liga' },
  { id: 'BL1', name: 'Bundesliga' },
  { id: 'SA', name: 'Serie A' },
  { id: 'FL1', name: 'Ligue 1' },
  { id: 'CL', name: 'Champions League' },
  { id: 'WC', name: 'World Cup' },
];

export default function TableScreen() {
  const [standings, setStandings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLeague, setSelectedLeague] = useState('PL');

  useEffect(() => {
    setLoading(true);
    fetch(`https://api.football-data.org/v4/competitions/${selectedLeague}/standings?season=2025`, {
      headers: { 'X-Auth-Token': 'ae94b936902e463b9cd2ca4963dfdb09' },
    })
      .then((res) => res.json())
      .then((data) => {
        const table = data?.standings?.[0]?.table || [];
        const mapped = table.map((entry) => ({
          id: String(entry.position),
          position: entry.position,
          teamName: entry.team.name,
          logo: entry.team.crest,
          played: entry.playedGames,
          goalDifference: entry.goalDifference,
          points: entry.points,
        }));
        setStandings(mapped);
        setLoading(false);
      })
      .catch((e) => {
        console.error(e);
        setLoading(false);
      });
  }, [selectedLeague]);

  return (
    <View style={styles.container}>
      <FlatList
        horizontal
        data={LEAGUES}
        keyExtractor={(item) => item.id}
        style={styles.leagueTabs}
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.leagueTab, selectedLeague === item.id && styles.leagueTabActive]}
            onPress={() => setSelectedLeague(item.id)}
          >
            <Text style={[styles.leagueText, selectedLeague === item.id && styles.leagueTextActive]}>
              {item.name}
            </Text>
          </TouchableOpacity>
        )}
      />
      <StandingsRow isHeader />
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#22C55E" />
        </View>
      ) : (
        <FlatList
          data={standings}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <StandingsRow team={item} />}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.emptyText}>Standings not available</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0F19' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 80 },
  emptyText: { color: '#F9FAFB', fontSize: 15 },
  leagueTabs: { paddingHorizontal: 12, paddingVertical: 10, maxHeight: 50 },
  leagueTab: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: '#1F2937', marginRight: 8 },
  leagueTabActive: { backgroundColor: '#22C55E' },
  leagueText: { color: '#9CA3AF', fontSize: 13, fontWeight: '600' },
  leagueTextActive: { color: '#0B0F19' },
});
