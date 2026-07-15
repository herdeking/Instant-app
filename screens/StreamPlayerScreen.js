import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';
import { COLORS } from '../theme';

export default function StreamPlayerScreen({ route }) {
  const { match } = route.params || {};
  const servers = [
    match?.stream && { label: match.streamLabel || 'Server 1', url: match.stream },
    match?.stream2 && { label: match.stream2Label || 'Server 2', url: match.stream2 },
    match?.stream3 && { label: match.stream3Label || 'Server 3', url: match.stream3 },
  ].filter(Boolean);

  const [activeServer, setActiveServer] = useState(0);

  if (!servers.length) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>No stream available for this match</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{match.home} vs {match.away}</Text>
        {servers.length > 1 && (
          <View style={styles.serverRow}>
            {servers.map((s, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.serverBtn, activeServer === i && styles.serverBtnActive]}
                onPress={() => setActiveServer(i)}
              >
                <Text style={[styles.serverBtnText, activeServer === i && styles.serverBtnTextActive]}>{s.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
      <WebView
        key={activeServer}
        source={{ uri: servers[activeServer].url }}
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
  header: { backgroundColor: COLORS.bg, padding: 12 },
  title: { color: COLORS.textPrimary, fontSize: 15, fontWeight: '700', textAlign: 'center', marginBottom: 8 },
  serverRow: { flexDirection: 'row', justifyContent: 'center', gap: 8 },
  serverBtn: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, backgroundColor: COLORS.bgCard, borderWidth: 1, borderColor: COLORS.border },
  serverBtnActive: { backgroundColor: COLORS.gold, borderColor: COLORS.gold },
  serverBtnText: { color: COLORS.textSecondary, fontSize: 12, fontWeight: '700' },
  serverBtnTextActive: { color: '#000' },
  webview: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.bg, padding: 20 },
  errorText: { color: COLORS.textPrimary, fontSize: 15, textAlign: 'center' },
});
