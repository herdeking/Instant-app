// screens/StreamPlayerScreen.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

// Receives the match object via navigation params, plays match.streamLink
export default function StreamPlayerScreen({ route }) {
  const { match } = route.params || {};
  const streamLink = match?.streamLink;

  if (!streamLink) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>No stream link available for this match</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{match.homeTeam} vs {match.awayTeam}</Text>
      </View>
      <WebView
        source={{ uri: streamLink }}
        style={styles.webview}
        allowsFullscreenVideo
        mediaPlaybackRequiresUserAction={false}
        javaScriptEnabled
        domStorageEnabled
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: { padding: 12, backgroundColor: '#0B0F19' },
  title: { color: '#F9FAFB', fontSize: 15, fontWeight: '700', textAlign: 'center' },
  webview: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0B0F19', padding: 20 },
  errorText: { color: '#F9FAFB', fontSize: 15, textAlign: 'center' },
});
