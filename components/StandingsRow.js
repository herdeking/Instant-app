import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { COLORS } from '../theme';

export default function StandingsRow({ team, isHeader }) {
  if (isHeader) {
    return (
      <View style={[styles.row, styles.headerRow]}>
        <Text style={[styles.pos, styles.headerText]}>#</Text>
        <Text style={[styles.name, styles.headerText]}>Club</Text>
        <Text style={[styles.stat, styles.headerText]}>P</Text>
        <Text style={[styles.stat, styles.headerText]}>GD</Text>
        <Text style={[styles.stat, styles.headerText, styles.pts]}>PTS</Text>
      </View>
    );
  }
  const { position, teamName, logo, played, goalDifference, points } = team;
  const isTop3 = position <= 3;
  return (
    <View style={[styles.row, isTop3 && styles.rowTop3]}>
      <Text style={[styles.pos, isTop3 && styles.posGold]}>{position}</Text>
      <View style={styles.name}>
        {logo ? <Image source={{ uri: logo }} style={styles.logo} /> : <View style={styles.logoPlaceholder} />}
        <Text style={styles.teamName} numberOfLines={1}>{teamName}</Text>
      </View>
      <Text style={styles.stat}>{played}</Text>
      <Text style={[styles.stat, goalDifference > 0 && styles.positive, goalDifference < 0 && styles.negative]}>
        {goalDifference > 0 ? `+${goalDifference}` : goalDifference}
      </Text>
      <Text style={[styles.stat, styles.pts, isTop3 && styles.ptsGold]}>{points}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  headerRow: { borderBottomWidth: 1, borderBottomColor: COLORS.gold, paddingBottom: 10 },
  rowTop3: { backgroundColor: 'rgba(245, 158, 11, 0.05)' },
  headerText: { color: COLORS.gold, fontWeight: '800', fontSize: 11, letterSpacing: 1 },
  pos: { width: 26, color: COLORS.textSecondary, fontWeight: '700', fontSize: 13 },
  posGold: { color: COLORS.gold },
  name: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  logo: { width: 22, height: 22, resizeMode: 'contain' },
  logoPlaceholder: { width: 22, height: 22, borderRadius: 11, backgroundColor: COLORS.bgCardAlt },
  teamName: { color: COLORS.textPrimary, fontSize: 13, fontWeight: '600', flexShrink: 1 },
  stat: { width: 38, textAlign: 'center', color: COLORS.textSecondary, fontSize: 13 },
  pts: { color: COLORS.textPrimary, fontWeight: '800' },
  ptsGold: { color: COLORS.gold },
  positive: { color: '#22C55E' },
  negative: { color: '#EF4444' },
});
