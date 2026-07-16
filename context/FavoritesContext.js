import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FavoritesContext = createContext(null);

export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    AsyncStorage.getItem('favorites').then((val) => {
      if (val) setFavorites(JSON.parse(val));
    });
  }, []);

  const toggleFavorite = async (match) => {
    const exists = favorites.find((f) => f.id === match.id);
    const updated = exists
      ? favorites.filter((f) => f.id !== match.id)
      : [...favorites, { id: match.id, home: match.home, away: match.away, comp: match.comp, date: match.date, status: match.status }];
    setFavorites(updated);
    await AsyncStorage.setItem('favorites', JSON.stringify(updated));
  };

  const isFavorite = (matchId) => favorites.some((f) => f.id === matchId);

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites must be used within FavoritesProvider');
  return ctx;
}
