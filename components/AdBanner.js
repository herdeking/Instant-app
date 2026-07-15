import React, { useEffect, useState } from 'react';
import { View, Image, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { COLORS } from '../theme';

export default function AdBanner() {
  const [ad, setAd] = useState(null);

  useEffect(() => {
    const q = query(collection(db, 'ads'), where('status', '==', 'Active'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        setAd({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() });
      }
    });
    return unsubscribe;
  }, []);

  if (!ad?.imageUrl && !ad?.image) return null;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => ad.link && Linking.openURL(ad.link)}
      activeOpacity={0.9}
    >
      <View style={styles.adLabel}><Image source={{ uri: ad.imageUrl || ad.image }} style={styles.image} resizeMode="cover" /></View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { marginHorizontal: 12, marginVertical: 8, borderRadius: 10, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.border },
  image: { width: '100%', height: 80 },
});
