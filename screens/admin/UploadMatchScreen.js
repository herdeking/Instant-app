import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Switch, Alert } from 'react-native';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

export default function UploadMatchScreen({ navigation }) {
  const [home, setHome] = useState('');
  const [away, setAway] = useState('');
  const [comp, setComp] = useState('');
  const [date, setDate] = useState('');
  const [stream, setStream] = useState('');
  const [homeLogo, setHomeLogo] = useState('');
  const [awayLogo, setAwayLogo] = useState('');
  const [isLive, setIsLive] = useState(false);
  const [saving, setSaving] = useState(false);

  const resetForm = () => { setHome(''); setAway(''); setComp(''); setDate(''); setStream(''); setHomeLogo(''); setAwayLogo(''); setIsLive(false); };

  const handleUpload = async () => {
    if (!home.trim() || !away.trim() || !date.trim()) {
      Alert.alert('Missing info', 'Home team, away team, and date are required.');
      return;
    }
    setSaving(true);
    try {
      await addDoc(collection(db, 'matches'), {
        home: home.trim(),
        away: away.trim(),
        comp: comp.trim(),
        date: date.trim(),
        stream: stream.trim(),
        homeLogo: homeLogo.trim(),
        awayLogo: awayLogo.trim(),
        status: isLive ? 'live' : 'upcoming',
        hscore: 0,
        ascore: 0,
        createdAt: serverTimestamp(),
      });
      Alert.alert('Success', 'Match uploaded!', [
        { text: 'Add another', onPress: resetForm },
        { text: 'Done', onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Could not upload match.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20 }}>
      <Text style={styles.label}>Home Team *</Text>
      <TextInput style={styles.input} value={home} onChangeText={setHome} placeholder="e.g. Arsenal" placeholderTextColor="#6B7280" />
      <Text style={styles.label}>Away Team *</Text>
      <TextInput style={styles.input} value={away} onChangeText={setAway} placeholder="e.g. Chelsea" placeholderTextColor="#6B7280" />
      <Text style={styles.label}>Competition</Text>
      <TextInput style={styles.input} value={comp} onChangeText={setComp} placeholder="e.g. Premier League" placeholderTextColor="#6B7280" />
      <Text style={styles.label}>Date *</Text>
      <TextInput style={styles.input} value={date} onChangeText={setDate} placeholder="e.g. 2026/07/15" placeholderTextColor="#6B7280" />
      <Text style={styles.label}>Stream Link</Text>
      <TextInput style={styles.input} value={stream} onChangeText={setStream} placeholder="https://..." placeholderTextColor="#6B7280" autoCapitalize="none" />
      <Text style={styles.label}>Home Logo URL</Text>
      <TextInput style={styles.input} value={homeLogo} onChangeText={setHomeLogo} placeholder="https://..." placeholderTextColor="#6B7280" autoCapitalize="none" />
      <Text style={styles.label}>Away Logo URL</Text>
      <TextInput style={styles.input} value={awayLogo} onChangeText={setAwayLogo} placeholder="https://..." placeholderTextColor="#6B7280" autoCapitalize="none" />
      <View style={styles.switchRow}>
        <Text style={styles.label}>Mark as Live</Text>
        <Switch value={isLive} onValueChange={setIsLive} trackColor={{ false: '#374151', true: '#22C55E' }} thumbColor="#F9FAFB" />
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
  input: { backgroundColor: '#1F2937', color: '#F9FAFB', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15 },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20 },
  button: { backgroundColor: '#22C55E', borderRadius: 10, paddingVertical: 14, alignItems: 'center', marginTop: 28, marginBottom: 40 },
  buttonText: { color: '#0B0F19', fontWeight: '800', fontSize: 15 },
});
