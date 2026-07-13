// screens/admin/AdminLoginScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';

export default function AdminLoginScreen({ navigation }) {
  const { loginWithUsername } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!username.trim() || !password) {
      setError('Enter username and password');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await loginWithUsername(username, password);
      // onAuthStateChanged in AuthContext will flip isAdmin; navigation handled by root navigator
    } catch (e) {
      console.error(e);
      setError('Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={styles.logo}>FullTime Admin</Text>
      <Text style={styles.subtitle}>Sign in to manage matches</Text>

      <TextInput
        style={styles.input}
        placeholder="Username"
        placeholderTextColor="#6B7280"
        autoCapitalize="none"
        autoCorrect={false}
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#6B7280"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
        {loading ? <ActivityIndicator color="#0B0F19" /> : <Text style={styles.buttonText}>Sign In</Text>}
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0F19', justifyContent: 'center', padding: 24 },
  logo: { color: '#22C55E', fontSize: 26, fontWeight: '800', textAlign: 'center', marginBottom: 4 },
  subtitle: { color: '#9CA3AF', fontSize: 14, textAlign: 'center', marginBottom: 32 },
  input: {
    backgroundColor: '#1F2937',
    color: '#F9FAFB',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 14,
    fontSize: 15,
  },
  error: { color: '#F87171', fontSize: 13, marginBottom: 10, textAlign: 'center' },
  button: {
    backgroundColor: '#22C55E',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: { color: '#0B0F19', fontWeight: '800', fontSize: 15 },
});
