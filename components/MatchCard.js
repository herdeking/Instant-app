import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';

export default function MatchCard({ match, onPress }) {
  const { home, away, homeLogo, awayLogo, date, status, hscore, ascore, comp } = match;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      {comp ? <Text style={styles.competition}>{comp}</Text> : null}
      <View style={styles.row}>
        <View style={styles.team}>
          {homeLogo ? <Image source={{ uri: homeLogo }} style={styles.logo} /> : <View style={styles.logoPlaceholder} />}
          <Text style={styles.teamName} numberOfLines={1}>{home}</Text>
        </View>
        <View style={styles.center}>
          {status === 'live' && <View style={styles.liveBadge}><Text style={styles.liveText}>LIVE</Text></View>}
          {status === 'finished' || status === 'live' ? (
            <Text style={styles.score}>{hscore ?? 0} - {ascore ?? 0}</Text>
          ) : (
            <Text style={styles.time}>{date}</Text>
          )}
        </View>
        <View style={styles.team}>
          {awayLogo ? <Image source={{ uri: awayLogo }} style={styles.logo} /> : <View style={styles.logoPlaceholder} />}
          <Text style={styles.teamName} numberOfLines={1}>{away}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#111827', borderRadius: 12, padding: 14, marginVertical: 6, marginHorizontal: 12 },
  competition: { color: '#9CA3AF', fontSize: 12, marginBottom: 8, textTransform: 'uppercase' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  team: { flex: 1, alignItems: 'center' },
  logo: { width: 32, height: 32, marginBottom: 4, resizeMode: 'contain' },
  logoPlaceholder: { width: 32, height: 32, marginBottom: 4, borderRadius: 16, backgroundColor: '#374151' },
  teamName: { color: '#F9FAFB', fontSize: 13, fontWeight: '600', textAlign: 'center' },
  center: { flex: 0.8, alignItems: 'center' },
  score: { color: '#FFFFFF', fontSize: 20, fontWeight: '800' },
  time: { color: '#9CA3AF', fontSize: 14, fontWeight: '600' },
  liveBadge: { backgroundColor: '#DC2626', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, marginBottom: 4 },
  liveText: { color: '#FFFFFF', fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
});
