// components/NewsCard.js
import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';

// Expects { id, title, summary, imageUrl, source, publishedAt }
export default function NewsCard({ article, onPress }) {
  const { title, summary, imageUrl, source, publishedAt } = article;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      {imageUrl ? <Image source={{ uri: imageUrl }} style={styles.image} /> : null}
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>{title}</Text>
        {summary ? <Text style={styles.summary} numberOfLines={2}>{summary}</Text> : null}
        <View style={styles.metaRow}>
          {source ? <Text style={styles.meta}>{source}</Text> : null}
          {publishedAt ? <Text style={styles.meta}>{publishedAt}</Text> : null}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#111827',
    borderRadius: 12,
    marginVertical: 6,
    marginHorizontal: 12,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 160,
  },
  content: {
    padding: 12,
  },
  title: {
    color: '#F9FAFB',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  summary: {
    color: '#9CA3AF',
    fontSize: 13,
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  meta: {
    color: '#6B7280',
    fontSize: 11,
  },
});
