import { InterstitialAd, AdEventType, TestIds } from 'react-native-google-mobile-ads';

const PRODUCTION_UNIT_ID = 'ca-app-pub-5150043080807634/3407659861';
const adUnitId = __DEV__ ? TestIds.INTERSTITIAL : PRODUCTION_UNIT_ID;

let interstitial = InterstitialAd.createForAdRequest(adUnitId);
let isLoaded = false;

function loadAd() {
  isLoaded = false;
  interstitial.load();
}

interstitial.addAdEventListener(AdEventType.LOADED, () => {
  isLoaded = true;
});

interstitial.addAdEventListener(AdEventType.CLOSED, () => {
  // Pre-load the next one immediately so it's ready for the next stream open
  loadAd();
});

interstitial.addAdEventListener(AdEventType.ERROR, () => {
  isLoaded = false;
});

// Kick off the first load
loadAd();

// Shows the interstitial if ready; always calls onDone afterward (whether
// the ad showed or not) so navigation can proceed either way.
export function showInterstitialThenContinue(onDone) {
  if (isLoaded) {
    const unsubscribe = interstitial.addAdEventListener(AdEventType.CLOSED, () => {
      unsubscribe();
      onDone();
    });
    interstitial.show();
  } else {
    onDone();
  }
}
