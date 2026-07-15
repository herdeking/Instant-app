import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator, Text, Linking, RefreshControl } from 'react-native';
import NewsCard from '../components/NewsCard';

const NEWS_API_KEY = 'adf1b30fb4cd4c2abbedbf1985a97929';

export default function NewsScreen() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNews = async () => {
    try {
      const res = await fetch(
        `https://newsapi.org/v2/everything?q=football&language=en&pageSize=20&sortBy=publishedAt&apiKey=${NEWS_API_KEY}`
      );
      const data = await res.json();
      const mapped = (data.articles || []).map((a, i) => ({
        id: String(i),
        title: a.title,
        summary: a.description,
        imageUrl: a.urlToImage,
        source: a.source?.name,
        publishedAt: a.publishedAt?.slice(0, 10),
        url: a.url,
      }));
      setArticles(mapped);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchNews(); }, []);

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#22C55E" /></View>;

  return (
    <View style={styles.container}>
      <FlatList
        data={articles}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingVertical: 12 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchNews(); }} tintColor="#22C55E" />}
        renderItem={({ item }) => (
          <NewsCard article={item} onPress={() => item.url && Linking.openURL(item.url)} />
        )}
        ListEmptyComponent={<View style={styles.center}><Text style={styles.emptyText}>No news available</Text></View>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0F19' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 80 },
  emptyText: { color: '#F9FAFB', fontSize: 15 },
});
