import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme';

const INJECTED_CSS = `
  (function() {
    var style = document.createElement('style');
    style.innerHTML = \`
      header, nav, .header, .navbar, .top-bar, .server-list, .server-bar,
      [class*="header"], [class*="navbar"], [class*="topbar"], [class*="server"] {
        display: none !important;
        height: 0 !important;
        max-height: 0 !important;
        overflow: hidden !important;
      }
      body, html { margin: 0 !important; padding: 0 !important; }
      video, iframe { width: 100% !important; height: 100% !important; }
    \`;
    document.head.appendChild(style);
  })();
  true;
`;

export default function StreamPlayerScreen({ route, navigation }) {
  const { COLORS } = useTheme();
  const styles = getStyles(COLORS);
  const { match } = route.params || {};

  // Prefer the `streams` array (supports any number of servers).
  // Fall back to legacy flat fields (stream, stream2, stream3) for older match docs.
  const servers = (Array.isArray(match?.streams) && match.streams.length > 0)
    ? match.streams
        .filter((s) => s?.url)
        .map((s, i) => ({ label: s.label || `Server ${i + 1}`, url: s.url }))
    : [
        match?.stream && { label: match.streamLabel || 'Server 1', url: match.stream },
        match?.stream2 && { label: match.stream2Label || 'Server 2', url: match.stream2 },
        match?.stream3 && { label: match.stream3Label || 'Server 3', url: match.stream3 },
      ].filter(Boolean);

  const [activeServer, setActiveServer] = useState(0);
  const [controlsVisible, setControlsVisible] = useState(true);

  if (!servers.length) {
    return (
      <View style={styles.center}>
        <TouchableOpacity style={styles.backBtnFallback} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.errorText}>No stream available for this match</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      <WebView
        key={activeServer}
        source={{ uri: servers[activeServer].url }}
        style={styles.webview}
        allowsFullscreenVideo
        mediaPlaybackRequiresUserAction={false}
        javaScriptEnabled
        domStorageEnabled
        injectedJavaScript={INJECTED_CSS}
        onMessage={() => {}}
      />
      <TouchableOpacity
        style={styles.floatingBack}
        onPress={() => setControlsVisible((v) => !v)}
        onLongPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={20} color="#fff" />
      </TouchableOpacity>
      {controlsVisible && servers.length > 1 && (
        <View style={styles.floatingServerRow}>
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
  );
}

function getStyles(COLORS) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    webview: { flex: 1 },
    floatingBack: { position: 'absolute', top: 12, left: 12, width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'center', alignItems: 'center', zIndex: 10 },
    floatingServerRow: { position: 'absolute', top: 12, right: 12, flexDirection: 'row', gap: 6, zIndex: 10 },
    serverBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: 'rgba(0,0,0,0.55)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
    serverBtnActive: { backgroundColor: COLORS.gold, borderColor: COLORS.gold },
    serverBtnText: { color: '#fff', fontSize: 11, fontWeight: '700' },
    serverBtnTextActive: { color: '#000' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000', padding: 20 },
    backBtnFallback: { position: 'absolute', top: 12, left: 12, width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
    errorText: { color: COLORS.textPrimary, fontSize: 15, textAlign: 'center' },
  });
}
