// screens/TableScreen.js
import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import StandingsRow from '../components/StandingsRow';

// Assumes a "standings" collection, one doc per team, ordered by position
export default function TableScreen() {
  const [standings, setStandings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'standings'), orderBy('position', 'asc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setStandings(data);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching standings:', error);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#22C55E" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StandingsRow isHeader />
      <FlatList
        data={standings}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <StandingsRow team={item} />}
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={styles.emptyText}>Standings not available yet</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0F19' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 80 },
  emptyText: { color: '#F9FAFB', fontSize: 15 },
});
