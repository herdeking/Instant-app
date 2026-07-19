import * as Notifications from 'expo-notifications';
import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';

const TASK_NAME = 'CHECK_LIVE_MATCHES';
const NOTIFIED_IDS_KEY = '@notified_live_match_ids';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

async function getNotifiedIds() {
  try {
    const stored = await AsyncStorage.getItem(NOTIFIED_IDS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

async function addNotifiedId(matchId) {
  const ids = await getNotifiedIds();
  const updated = [...new Set([...ids, matchId])].slice(-100); // keep last 100 to avoid unbounded growth
  await AsyncStorage.setItem(NOTIFIED_IDS_KEY, JSON.stringify(updated));
}

async function checkForNewlyLiveMatches() {
  const alreadyNotified = await getNotifiedIds();

  const q = query(collection(db, 'matches'), where('status', '==', 'live'));
  const snapshot = await getDocs(q);

  for (const doc of snapshot.docs) {
    const match = doc.data();
    if (!alreadyNotified.includes(doc.id)) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `🔴 LIVE: ${match.home} vs ${match.away}`,
          body: `${match.comp || 'Football'} is live now — tap to watch!`,
          data: { matchId: doc.id },
        },
        trigger: null, // fire immediately
      });
      await addNotifiedId(doc.id);
    }
  }
}

TaskManager.defineTask(TASK_NAME, async () => {
  try {
    await checkForNewlyLiveMatches();
    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (err) {
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

export async function registerLiveMatchBackgroundTask() {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') return;

  const isRegistered = await TaskManager.isTaskRegisteredAsync(TASK_NAME);
  if (!isRegistered) {
    await BackgroundFetch.registerTaskAsync(TASK_NAME, {
      minimumInterval: 15 * 60, // Android minimum is ~15 minutes regardless of what's set
      stopOnTerminate: false,
      startOnBoot: true,
    });
  }
}

// Also check immediately when the app is opened/foregrounded, since
// background fetch intervals are not guaranteed to be frequent or reliable.
export async function checkNowIfAppOpen() {
  try {
    await checkForNewlyLiveMatches();
  } catch {}
}
