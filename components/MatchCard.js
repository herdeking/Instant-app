import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Animated, Share } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../theme';
import { useFavorites } from '../context/FavoritesContext';

const logoCache = {};

function useTeamLogo(teamName, existingLogo) {
  const [logo, setLogo] = useState(existingLogo || logoCache[teamName] || null);
  useEffect(() => {
    if (existingLogo) { setLogo(existingLogo); return; }
    if (!teamName) return;
    if (logoCache[teamName]) { setLogo(logoCache[teamName]); return; }
    fetch(`https://v3.football.api-sports.io/teams?search=${encodeURIComponent(teamName)}`, {
      headers: { 'x-apisports-key': '14fc22d6286abe7f65bd37725b8fb926' },
    })
      .then((r) => r.json())
      .then((data) => {
        const team = data?.response?.[0]?.team;
        if (team?.logo) { logoCache[teamName] = team.logo; setLogo(team.logo); }
      })
      .catch(() => {});
  }, [teamName, existingLogo]);
  return logo;
}

function LivePulse() {
  const pulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(pulse, { toValue: 1.4, duration: 700, useNativeDriver: true }),
      Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver: true }),
    ])).start();
  }, []);
  return (
    <View style={styles.liveContainer}>
      <Animated.View style={[styles.liveDot, { transform: [{ scale: pulse }] }]} />
      <Text style={styles.liveText}>LIVE</Text>
    </View>
  );
}

export default function MatchCard({ match, onPress, showActions = true }) {
  const { home, away, homeLogo, awayLogo, hlogo, alogo, date, status, hscore, ascore, comp, minute } = match;
  const finalHomeLogo = useTeamLogo(home, hlogo || homeLogo);
  const finalAwayLogo = useTeamLogo(away, alogo || awayLogo);
  const isLive = status === 'live';
  const isFinished = status === 'finished';
  const { toggleFavorite, isFavorite } = useFavorites();
  const favorited = isFavorite(match.id);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `🔴 Watch ${home} vs ${away} ${isLive ? 'LIVE' : ''} on FullTime!\nhttps://www.instantlivefootball.com.ng`,
        title: `${home} vs ${away}`,
      });
    } catch (e) {}
  };

  return (
    <TouchableOpacity style={[styles.card, isLive && styles.cardLive]} onPress={onPress} activeOpacity={0.8}>
      {comp ? (
        <View style={styles.compRow}>
          <View style={styles.compDot} />
          <Text style={styles.competition}>{comp.toUpperCase()}</Text>
          {isLive && <LivePulse />}
        </View>
      ) : isLive ? <View style={styles.compRow}><LivePulse /></View> : null}
      <View style={styles.row}>
        <View style={styles.team}>
          {finalHomeLogo ? <Image source={{ uri: finalHomeLogo }} style={styles.logo} /> : <View style={styles.logoPlaceholder} />}
          <Text style={styles.teamName} numberOfLines={2}>{home}</Text>
        </View>
        <View style={styles.center}>
          {isLive || isFinished ? (
            <Text style={[styles.score, isLive && styles.scoreLive]}>{hscore ?? 0} - {ascore ?? 0}</Text>
          ) : (
            <><Text style={styles.vs}>VS</Text><Text style={styles.time}>{date}</Text></>
          )}
          {isLive && minute ? <Text style={styles.minute}>{minute}'</Text> : null}
        </View>
        <View style={styles.team}>
          {finalAwayLogo ? <Image source={{ uri: finalAwayLogo }} style={styles.logo} /> : <View style={styles.logoPlaceholder} />}
          <Text style={styles.teamName} numberOfLines={2}>{away}</Text>
        </View>
      </View>
      {isLive && <View style={styles.goldBar} />}
      {showActions && (
        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => toggleFavorite(match)}>
            <Ionicons name={favorited ? 'star' : 'star-outline'} size={16} color={favorited ? COLORS.gold : COLORS.textMuted} />
            <Text style={[styles.actionText, favorited && styles.actionTextActive]}>{favorited ? 'Saved' : 'Save'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={handleShare}>
            <Ionicons name="share-social-outline" size={16} color={COLORS.textMuted} />
            <Text style={styles.actionText}>Share</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: COLORS.bgCard, borderRadius: 14, padding: 16, marginVertical: 6, marginHorizontal: 12, borderWidth: 1, borderColor: COLORS.border },
  cardLive: { borderColor: COLORS.gold },
  compRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 6 },
  compDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: COLORS.gold },
  competition: { color: COLORS.gold, fontSize: 10, fontWeight: '700', letterSpacing: 1.5, flex: 1 },
  liveContainer: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: COLORS.live },
  liveText: { color: COLORS.live, fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  team: { flex: 1, alignItems: 'center', gap: 8 },
  logo: { width: 40, height: 40, resizeMode: 'contain' },
  logoPlaceholder: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.bgCardAlt, borderWidth: 1, borderColor: COLORS.border },
  teamName: { color: COLORS.textPrimary, fontSize: 13, fontWeight: '700', textAlign: 'center' },
  center: { flex: 0.9, alignItems: 'center', gap: 4 },
  score: { color: COLORS.textPrimary, fontSize: 28, fontWeight: '800', letterSpacing: 1 },
  scoreLive: { color: COLORS.gold },
  vs: { color: COLORS.textMuted, fontSize: 14, fontWeight: '800', letterSpacing: 2 },
  time: { color: COLORS.textSecondary, fontSize: 12, fontWeight: '600' },
  minute: { color: COLORS.live, fontSize: 12, fontWeight: '800' },
  goldBar: { height: 2, backgroundColor: COLORS.gold, borderRadius: 1, marginTop: 12, opacity: 0.6 },
  actionsRow: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 12, gap: 16, borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 10 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  actionText: { color: COLORS.textMuted, fontSize: 12, fontWeight: '600' },
  actionTextActive: { color: COLORS.gold },
});
