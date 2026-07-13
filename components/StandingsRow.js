// components/StandingsRow.js
import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

// Expects { position, teamName, logo, played, won, drawn, lost, goalDifference, points }
export default function StandingsRow({ team, isHeader }) {
  if (isHeader) {
    return (
      <View style={[styles.row, styles.headerRow]}>
        <Text style={[styles.pos, styles.headerText]}>#</Text>
        <Text style={[styles.name, styles.headerText]}>Team</Text>
        <Text style={[styles.stat, styles.headerText]}>P</Text>
        <Text style={[styles.stat, styles.headerText]}>GD</Text>
        <Text style={[styles.stat, styles.headerText]}>Pts</Text>
      </View>
    );
  }

  const { position, teamName, logo, played, goalDifference, points } = team;

  return (
    <View style={styles.row}>
      <Text style={styles.pos}>{position}</Text>
      <View style={styles.name}>
        {logo ? <Image source={{ uri: logo }} style={styles.logo} /> : null}
        <Text style={styles.teamName} numberOfLines={1}>{teamName}</Text>
      </View>
      <Text style={styles.stat}>{played}</Text>
      <Text style={styles.stat}>{goalDifference}</Text>
      <Text style={[styles.stat, styles.points]}>{points}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1F2937',
  },
  headerRow: {
    borderBottomWidth: 2,
    borderBottomColor: '#374151',
  },
  headerText: {
    color: '#9CA3AF',
    fontWeight: '700',
    fontSize: 12,
  },
  pos: {
    width: 28,
    color: '#F9FAFB',
    fontWeight: '600',
  },
  name: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 20,
    height: 20,
    marginRight: 8,
    resizeMode: 'contain',
  },
  teamName: {
    color: '#F9FAFB',
    fontSize: 13,
    fontWeight: '500',
    flexShrink: 1,
  },
  stat: {
    width: 36,
    textAlign: 'center',
    color: '#D1D5DB',
    fontSize: 12,
  },
  points: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
});
