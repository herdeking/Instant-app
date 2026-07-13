# FullTime Mobile App

React Native (Expo) app for instantlivefootball.com.ng — Watch, Matches, News, Table, plus an in-app Admin flow for uploading matches and streaming links. Shares your existing Firebase project (`instantlivefootball`).

## 1. Fill in Firebase config

Open `firebaseConfig.js` and replace the placeholder values with your real config from:
Firebase Console → Project Settings → General → Your apps → SDK setup and config.

## 2. Set up on Termux

```bash
pkg install nodejs git -y
npm install -g eas-cli

cd FullTimeApp
npm install
```

## 3. Run in development (Expo Go)

```bash
npx expo start
```

Scan the QR code with the **Expo Go** app on your phone (install from Play Store). This is the fastest way to test — no build needed, live reload works.

> Note: `react-native-webview` (used for the stream player) works in Expo Go for most stream link types, but some players/DRM-protected streams may need a full dev build (step 4) to work correctly.

## 4. Build a real APK (for testing outside Expo Go, or installing directly)

```bash
eas login
eas build:configure
eas build -p android --profile preview
```

This builds in the cloud — no Android Studio needed on your phone. When done, EAS gives you a download link for the `.apk`. Install it directly on your phone (enable "install unknown apps" if prompted).

## 5. Production build (Play Store)

```bash
eas build -p android --profile production
eas submit -p android
```

You'll need a Google Play Developer account ($25 one-time) to submit.

## Firestore collections this app expects

Set these up in Firebase Console (Firestore Database). Field names below are what the app currently queries — rename in the code if your existing schema differs:

- **`matches`** — `homeTeam`, `awayTeam`, `competition`, `kickoffTime`, `streamLink`, `homeLogo`, `awayLogo`, `isLive`, `status` (`upcoming`/`live`/`finished`), `homeScore`, `awayScore`
- **`news`** — `title`, `summary`, `imageUrl`, `source`, `publishedAt`, `url`
- **`standings`** — `position`, `teamName`, `logo`, `played`, `goalDifference`, `points`

## Admin login

Admin uses a **username**, internally mapped to `username@instantlivefootball.internal` for Firebase Auth (email/password). Create admin accounts in:
Firebase Console → Authentication → Users → Add user, using that email pattern.

To change the internal domain, edit `USERNAME_DOMAIN` in `context/AuthContext.js`.

Access admin from the app: **Table tab → gear icon (top right)**.

## Project structure

```
FullTimeApp/
├── App.js                     — root navigator (tabs + stream player + admin modal)
├── firebaseConfig.js          — Firebase init (fill in your config)
├── app.json / eas.json        — Expo + build config
├── navigation/
│   ├── BottomTabs.js          — Watch / Matches / News / Table
│   └── AdminStack.js          — login-gated admin screens
├── screens/
│   ├── WatchScreen.js         — live matches only
│   ├── MatchesScreen.js       — all matches, filterable
│   ├── NewsScreen.js
│   ├── TableScreen.js
│   ├── StreamPlayerScreen.js  — WebView stream playback
│   └── admin/
│       ├── AdminLoginScreen.js
│       ├── AdminDashboardScreen.js
│       ├── UploadMatchScreen.js
│       └── ManageMatchesScreen.js
├── components/
│   ├── MatchCard.js
│   ├── NewsCard.js
│   └── StandingsRow.js
└── context/
    └── AuthContext.js
```

## Known next steps

- Confirm Firestore field names match your actual schema (or tell Claude the schema and it'll update queries)
- Add push notifications (you already have this on web — can port to Expo Notifications)
- Add Paystack subscription gating for premium streams, if you want that on mobile too
- App icons/splash currently point to `./assets/` — add real icon/splash images before building for the store
