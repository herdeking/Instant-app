import React, { useEffect, useState } from 'react';
import { View, Image, TouchableOpacity, Text, StyleSheet, Linking } from 'react-native';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { COLORS } from '../theme';

export default function AdBanner() {
  const [ad, setAd] = useState(null);

  useEffect(() => {
    const q = query(collection(db, 'ads'), where('active', '==', true));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        setAd({ id: doc.id, ...doc.data() });
      } else {
        setAd(null);
      }
    });
    return unsubscribe;
  }, []);

  if (!ad?.imageUrl) return null;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => ad.link && Linking.openURL(ad.link)}
      activeOpacity={0.9}
    >
      <View style={styles.adTag}><Text style={styles.adTagText}>AD</Text></View>
      <Image source={{ uri: ad.imageUrl }} style={styles.image} resizeMode="cover" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { marginHorizontal: 12, marginVertical: 8, borderRadius: 10, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.border },
  adTag: { position: 'absolute', top: 6, right: 6, zIndex: 1, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  adTagText: { color: '#fff', fontSize: 9, fontWeight: '700' },
  image: { width: '100%', height: 90 },
});
