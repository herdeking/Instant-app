import React, { useEffect, useRef, useState } from 'react';
import { View, Image, TouchableOpacity, Text, StyleSheet, Linking, FlatList, Dimensions } from 'react-native';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { COLORS } from '../theme';

const SCREEN_WIDTH = Dimensions.get('window').width;
const BANNER_WIDTH = SCREEN_WIDTH - 24; // accounts for marginHorizontal: 12 on each side
const AUTO_SLIDE_INTERVAL = 4000;

export default function AdBanner() {
  const [ads, setAds] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const listRef = useRef(null);
  const indexRef = useRef(0);

  useEffect(() => {
    const q = query(collection(db, 'ads'), where('active', '==', true));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setAds(data);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (ads.length <= 1) return;

    const timer = setInterval(() => {
      const nextIndex = (indexRef.current + 1) % ads.length;
      indexRef.current = nextIndex;
      setActiveIndex(nextIndex);
      listRef.current?.scrollToOffset({ offset: nextIndex * BANNER_WIDTH, animated: true });
    }, AUTO_SLIDE_INTERVAL);

    return () => clearInterval(timer);
  }, [ads.length]);

  const onMomentumScrollEnd = (e) => {
    const newIndex = Math.round(e.nativeEvent.contentOffset.x / BANNER_WIDTH);
    indexRef.current = newIndex;
    setActiveIndex(newIndex);
  };

  const validAds = ads.filter((ad) => ad.imageUrl);
  if (validAds.length === 0) return null;

  return (
    <View style={styles.wrapper}>
      <FlatList
        ref={listRef}
        data={validAds}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onMomentumScrollEnd}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.container, { width: BANNER_WIDTH }]}
            onPress={() => item.link && Linking.openURL(item.link)}
            activeOpacity={0.9}
          >
            <View style={styles.adTag}><Text style={styles.adTagText}>AD</Text></View>
            <Image source={{ uri: item.imageUrl }} style={styles.image} resizeMode="cover" />
          </TouchableOpacity>
        )}
      />
      {validAds.length > 1 && (
        <View style={styles.dotsRow}>
          {validAds.map((_, i) => (
            <View key={i} style={[styles.dot, i === activeIndex && styles.dotActive]} />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginVertical: 8 },
  container: { marginHorizontal: 12, borderRadius: 10, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.border },
  adTag: { position: 'absolute', top: 6, right: 6, zIndex: 1, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  adTagText: { color: '#fff', fontSize: 9, fontWeight: '700' },
  image: { width: '100%', height: 90 },
  dotsRow: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 8 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.border },
  dotActive: { backgroundColor: COLORS.gold, width: 16 },
});
