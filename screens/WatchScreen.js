import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, Text, ActivityIndicator, RefreshControl } from 'react-native';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import MatchCard from '../components/MatchCard';

export default function WatchScreen({ navigation }) {
  const [liveMatches, setLiveMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'matches'), where('status', '==', 'live'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setLiveMatches(data);
      setLoading(false);
      setRefreshing(false);
    }, (error) => {
      console.error(error);
      setLoading(false);
      setRefreshing(false);
    });
    return unsubscribe;
  }, []);

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#22C55E" /></View>;

  return (
    <View style={styles.container}>
      <FlatList
        data={liveMatches}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingVertical: 12 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => setRefreshing(true)} tintColor="#22C55E" />}
        renderItem={({ item }) => (
          <MatchCard match={item} onPress={() => navigation.navigate('StreamPlayer', { match: item })} />
        )}
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={styles.emptyText}>No live matches right now</Text>
            <Text style={styles.emptySubtext}>Check back closer to kickoff</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0F19' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 80 },
  emptyText: { color: '#F9FAFB', fontSize: 16, fontWeight: '600' },
  emptySubtext: { color: '#6B7280', fontSize: 13, marginTop: 4 },
});
