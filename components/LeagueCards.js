import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../theme';

const LEAGUES = [
  { name: 'Premier League', short: 'PL', colors: ['#3d0066', '#8B0000'] },
  { name: 'World Cup', short: 'WC', colors: ['#003d00', '#007700'] },
  { name: 'UCL', short: 'UCL', colors: ['#000080', '#1a1aff'] },
  { name: 'La Liga', short: 'LL', colors: ['#8B0000', '#cc0000'] },
  { name: 'Serie A', short: 'SA', colors: ['#003380', '#0055cc'] },
  { name: 'Bundesliga', short: 'BL', colors: ['#8B1a00', '#cc3300'] },
  { name: 'Ligue 1', short: 'L1', colors: ['#003366', '#006699'] },
];

export default function LeagueCards({ onSelect, activeLeague }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Browse by League</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {LEAGUES.map((league) => {
          const isActive = activeLeague === league.name;
          return (
            <TouchableOpacity key={league.name} onPress={() => onSelect(isActive ? null : league.name)} activeOpacity={0.8} style={[styles.card, isActive && styles.cardActive]}>
              <LinearGradient colors={league.colors} style={styles.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                <Text style={styles.shortName}>{league.short}</Text>
                <Text style={styles.leagueName}>{league.name}</Text>
                {isActive && <View style={styles.activeCheck}><Text style={styles.checkText}>✓</Text></View>}
              </LinearGradient>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginVertical: 8 },
  title: { color: COLORS.textPrimary, fontSize: 15, fontWeight: '800', paddingHorizontal: 16, marginBottom: 10 },
  scroll: { paddingHorizontal: 12, gap: 10 },
  card: { borderRadius: 12, width: 110, height: 75, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  cardActive: { borderColor: COLORS.gold, borderWidth: 2 },
  gradient: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 10 },
  shortName: { color: 'rgba(255,255,255,0.5)', fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  leagueName: { color: '#fff', fontSize: 11, fontWeight: '800', textAlign: 'center', marginTop: 4 },
  activeCheck: { position: 'absolute', top: 6, right: 6, backgroundColor: COLORS.gold, borderRadius: 10, width: 16, height: 16, justifyContent: 'center', alignItems: 'center' },
  checkText: { color: '#000', fontSize: 10, fontWeight: '900' },
});
