import React from 'react';
import { View, StyleSheet } from 'react-native';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';

const PRODUCTION_UNIT_ID = 'ca-app-pub-5150043080807634/4843316458';

// Use Google's official test ad unit in dev so we never accidentally serve
// real ads (and risk policy violations) while testing.
const adUnitId = __DEV__ ? TestIds.BANNER : PRODUCTION_UNIT_ID;

export default function AdMobBanner() {
  return (
    <View style={styles.container}>
      <BannerAd
        unitId={adUnitId}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{ requestNonPersonalizedAdsOnly: false }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', marginVertical: 8 },
});
