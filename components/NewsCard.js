import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../theme';

export default function NewsCard({ article, onPress }) {
  const { title, summary, imageUrl, source, publishedAt } = article;
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      {imageUrl ? <Image source={{ uri: imageUrl }} style={styles.image} /> : <View style={styles.imagePlaceholder}><Text style={styles.placeholderText}>⚽</Text></View>}
      <View style={styles.content}>
        <View style={styles.metaRow}>
          {source ? <Text style={styles.source}>{source.toUpperCase()}</Text> : null}
          {publishedAt ? <Text style={styles.date}>{publishedAt}</Text> : null}
        </View>
        <Text style={styles.title} numberOfLines={3}>{title}</Text>
        {summary ? <Text style={styles.summary} numberOfLines={2}>{summary}</Text> : null}
        <Text style={styles.readMore}>Read more →</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: COLORS.bgCard, borderRadius: 14, marginVertical: 6, marginHorizontal: 12, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.border },
  image: { width: '100%', height: 180 },
  imagePlaceholder: { width: '100%', height: 100, backgroundColor: COLORS.bgCardAlt, justifyContent: 'center', alignItems: 'center' },
  placeholderText: { fontSize: 36 },
  content: { padding: 14 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  source: { color: COLORS.gold, fontSize: 10, fontWeight: '800', letterSpacing: 1.2 },
  date: { color: COLORS.textMuted, fontSize: 11 },
  title: { color: COLORS.textPrimary, fontSize: 15, fontWeight: '700', lineHeight: 22, marginBottom: 6 },
  summary: { color: COLORS.textSecondary, fontSize: 13, lineHeight: 19, marginBottom: 10 },
  readMore: { color: COLORS.gold, fontSize: 12, fontWeight: '700' },
});
