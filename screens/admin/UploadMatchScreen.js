// screens/admin/UploadMatchScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Switch,
  Alert,
} from 'react-native';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

export default function UploadMatchScreen({ navigation }) {
  const [homeTeam, setHomeTeam] = useState('');
  const [awayTeam, setAwayTeam] = useState('');
  const [competition, setCompetition] = useState('');
  const [kickoffTime, setKickoffTime] = useState('');
  const [streamLink, setStreamLink] = useState('');
  const [homeLogo, setHomeLogo] = useState('');
  const [awayLogo, setAwayLogo] = useState('');
  const [isLive, setIsLive] = useState(false);
  const [saving, setSaving] = useState(false);

  const resetForm = () => {
    setHomeTeam('');
    setAwayTeam('');
    setCompetition('');
    setKickoffTime('');
    setStreamLink('');
    setHomeLogo('');
    setAwayLogo('');
    setIsLive(false);
  };

  const handleUpload = async () => {
    if (!homeTeam.trim() || !awayTeam.trim() || !kickoffTime.trim()) {
      Alert.alert('Missing info', 'Home team, away team, and kickoff time are required.');
      return;
    }

    setSaving(true);
    try {
      await addDoc(collection(db, 'matches'), {
        homeTeam: homeTeam.trim(),
        awayTeam: awayTeam.trim(),
        competition: competition.trim(),
        kickoffTime: kickoffTime.trim(),
        streamLink: streamLink.trim(),
        homeLogo: homeLogo.trim(),
        awayLogo: awayLogo.trim(),
        isLive,
        status: isLive ? 'live' : 'upcoming',
        homeScore: 0,
        awayScore: 0,
        createdAt: serverTimestamp(),
      });

      Alert.alert('Success', 'Match uploaded successfully', [
        { text: 'Add another', onPress: resetForm },
        { text: 'Done', onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Could not upload match. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20 }}>
      <Text style={styles.label}>Home Team *</Text>
      <TextInput style={styles.input} value={homeTeam} onChangeText={setHomeTeam} placeholder="e.g. Arsenal" placeholderTextColor="#6B7280" />

      <Text style={styles.label}>Away Team *</Text>
      <TextInput style={styles.input} value={awayTeam} onChangeText={setAwayTeam} placeholder="e.g. Chelsea" placeholderTextColor="#6B7280" />

      <Text style={styles.label}>Competition</Text>
      <TextInput style={styles.input} value={competition} onChangeText={setCompetition} placeholder="e.g. Premier League" placeholderTextColor="#6B7280" />

      <Text style={styles.label}>Kickoff Time *</Text>
      <TextInput style={styles.input} value={kickoffTime} onChangeText={setKickoffTime} placeholder="e.g. 2026-07-15 16:00" placeholderTextColor="#6B7280" />

      <Text style={styles.label}>Streaming Link</Text>
      <TextInput style={styles.input} value={streamLink} onChangeText={setStreamLink} placeholder="https://..." placeholderTextColor="#6B7280" autoCapitalize="none" />

      <Text style={styles.label}>Home Team Logo URL</Text>
      <TextInput style={styles.input} value={homeLogo} onChangeText={setHomeLogo} placeholder="https://..." placeholderTextColor="#6B7280" autoCapitalize="none" />

      <Text style={styles.label}>Away Team Logo URL</Text>
      <TextInput style={styles.input} value={awayLogo} onChangeText={setAwayLogo} placeholder="https://..." placeholderTextColor="#6B7280" autoCapitalize="none" />

      <View style={styles.switchRow}>
        <Text style={styles.label}>Mark as Live now</Text>
        <Switch
          value={isLive}
          onValueChange={setIsLive}
          trackColor={{ false: '#374151', true: '#22C55E' }}
          thumbColor="#F9FAFB"
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={handleUpload} disabled={saving}>
        {saving ? <ActivityIndicator color="#0B0F19" /> : <Text style={styles.buttonText}>Upload Match</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0F19' },
  label: { color: '#D1D5DB', fontSize: 13, fontWeight: '600', marginBottom: 6, marginTop: 12 },
  input: {
    backgroundColor: '#1F2937',
    color: '#F9FAFB',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
  },
  button: {
    backgroundColor: '#22C55E',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 28,
    marginBottom: 40,
  },
  buttonText: { color: '#0B0F19', fontWeight: '800', fontSize: 15 },
});
