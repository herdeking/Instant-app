import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Linking, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme';

const YOUTUBE_API_KEY = 'AIzaSyApJ_YuCqJSqq-yEwAtF35Myc14a_R9U38';
const cache = {};

async function searchHighlight(home, away) {
  const cacheKey = `${home}-${away}`;
  if (cache[cacheKey] !== undefined) return cache[cacheKey];

  try {
    const query = encodeURIComponent(`${home} vs ${away} highlights`);
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&type=video&maxResults=1&order=relevance&key=${YOUTUBE_API_KEY}`
    );
    const data = await res.json();
    const video = data?.items?.[0];
    const result = video
      ? {
          videoId: video.id.videoId,
          title: video.snippet.title,
          thumbnail: video.snippet.thumbnails?.medium?.url || video.snippet.thumbnails?.default?.url,
        }
      : null;
    cache[cacheKey] = result;
    return result;
  } catch {
    cache[cacheKey] = null;
    return null;
  }
}

export default function HighlightsSection({ home, away }) {
  const { COLORS } = useTheme();
  const styles = getStyles(COLORS);
  const [highlight, setHighlight] = useState(undefined); // undefined = loading, null = not found

  useEffect(() => {
    let cancelled = false;
    searchHighlight(home, away).then((result) => {
      if (!cancelled) setHighlight(result);
    });
    return () => { cancelled = true; };
  }, [home, away]);

  if (highlight === undefined) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="small" color={COLORS.gold} />
      </View>
    );
  }

  if (!highlight) return null; // no highlight found, don't show anything

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => Linking.openURL(`https://www.youtube.com/watch?v=${highlight.videoId}`)}
      activeOpacity={0.85}
    >
      <Image source={{ uri: highlight.thumbnail }} style={styles.thumbnail} resizeMode="cover" />
      <View style={styles.playOverlay}>
        <Ionicons name="play-circle" size={36} color="#fff" />
      </View>
      <View style={styles.labelRow}>
        <Ionicons name="logo-youtube" size={14} color="#FF0000" />
        <Text style={styles.label} numberOfLines={1}>Watch Highlights</Text>
      </View>
    </TouchableOpacity>
  );
}

function getStyles(COLORS) {
  return StyleSheet.create({
    container: { marginTop: 12, borderRadius: 10, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.border },
    loading: { marginTop: 12, height: 40, justifyContent: 'center', alignItems: 'center' },
    thumbnail: { width: '100%', height: 160, backgroundColor: COLORS.bgCardAlt },
    playOverlay: { position: 'absolute', top: 0, left: 0, right: 0, height: 160, justifyContent: 'center', alignItems: 'center' },
    labelRow: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8, paddingHorizontal: 10, backgroundColor: COLORS.bgCard },
    label: { color: COLORS.textPrimary, fontSize: 12, fontWeight: '700' },
  });
}
