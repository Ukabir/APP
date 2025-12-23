import { useEffect, useState } from 'react';
import { AdEventType, InterstitialAd, TestIds } from 'react-native-google-mobile-ads';

// Use Test ID for development
const adUnitId = TestIds.INTERSTITIAL;
const interstitial = InterstitialAd.createForAdRequest(adUnitId);

// Global variable to track cooldown across screen changes
let lastShownTime = 0;
const COOLDOWN_MS = 30000; // 30 seconds

export function useInterstitialAd() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const unsubscribeLoaded = interstitial.addAdEventListener(AdEventType.LOADED, () => {
      setLoaded(true);
    });

    const unsubscribeClosed = interstitial.addAdEventListener(AdEventType.CLOSED, () => {
      setLoaded(false);
      interstitial.load(); // Pre-load the next one immediately
    });

    if (!loaded) {
      interstitial.load();
    }

    return () => {
      unsubscribeLoaded();
      unsubscribeClosed();
    };
  }, []);

  const showAdWithCooldown = () => {
    const now = Date.now();
    if (loaded && (now - lastShownTime > COOLDOWN_MS)) {
      lastShownTime = now;
      interstitial.show();
      return true; // Ad was shown
    }
    return false; // Ad skipped due to cooldown or not loaded
  };

  return { showAdWithCooldown, isAdLoaded: loaded };
}