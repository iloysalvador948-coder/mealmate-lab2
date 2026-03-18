import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, Image, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS } from '../constants';

export default function FavoritesScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [favorites, setFavorites] = useState([]);

  useFocusEffect(useCallback(() => {
    const ids = global.favorites || new Set();
    const meals = global.favoriteMeals || {};
    setFavorites(Array.from(ids).map(id => meals[id]).filter(Boolean));
  }, []));

  const remove = (id) => {
    Alert.alert('Remove', 'Remove this recipe from favorites?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove', style: 'destructive', onPress: () => {
          global.favorites?.delete(id);
          if (global.favoriteMeals) delete global.favoriteMeals[id];
          setFavorites(prev => prev.filter(m => m.idMeal !== id));
        }
      }
    ]);
  };

  const clearAll = () => {
    Alert.alert('Clear All', 'Remove all saved recipes?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear All', style: 'destructive', onPress: () => {
          global.favorites = new Set();
          global.favoriteMeals = {};
          setFavorites([]);
        }
      }
    ]);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('RecipeDetail', { meal: item })}
      activeOpacity={0.85}
    >
      <Image source={{ uri: item.strMealThumb }} style={styles.cardImg} />
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle} numberOfLines={2}>{item.strMeal}</Text>
        <View style={styles.metaRow}>
          <View style={styles.metaTag}><Text style={styles.metaText}>🍽️ {item.strCategory}</Text></View>
          <View style={styles.metaTag}><Text style={styles.metaText}>🌍 {item.strArea || 'International'}</Text></View>
        </View>
      </View>
      <TouchableOpacity style={styles.removeBtn} onPress={() => remove(item.idMeal)}>
        <Text style={{ fontSize: 20 }}>💔</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>❤️ My Favorites</Text>
          <Text style={styles.subtitle}>{favorites.length} saved recipe{favorites.length !== 1 ? 's' : ''}</Text>
        </View>
        {favorites.length > 0 && (
          <TouchableOpacity style={styles.clearBtn} onPress={clearAll}>
            <Text style={styles.clearText}>🗑️ Clear All</Text>
          </TouchableOpacity>
        )}
      </View>

      {favorites.length === 0 ? (
        <View style={styles.empty}>
          <Text style={{ fontSize: 60, marginBottom: 14 }}>💔</Text>
          <Text style={styles.emptyTitle}>No Saved Recipes</Text>
          <Text style={styles.emptySub}>Tap the ❤️ icon on any recipe to save it here for quick access.</Text>
          <TouchableOpacity style={styles.exploreBtn} onPress={() => navigation.navigate('Explore')}>
            <Text style={styles.exploreBtnText}>🔍 Explore Recipes</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={favorites}
          renderItem={renderItem}
          keyExtractor={item => item.idMeal}
          contentContainerStyle={{ padding: 16 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 10 },
  title: { fontSize: 24, fontWeight: '800', color: COLORS.text },
  subtitle: { fontSize: 13, color: COLORS.textLight, marginTop: 2 },
  clearBtn: { padding: 8 },
  clearText: { fontSize: 14, color: COLORS.error, fontWeight: '600' },
  card: { flexDirection: 'row', backgroundColor: COLORS.white, borderRadius: 14, overflow: 'hidden', elevation: 2, marginBottom: 12, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 4 },
  cardImg: { width: 88, height: 88 },
  cardContent: { flex: 1, padding: 11 },
  cardTitle: { fontSize: 14, fontWeight: '700', color: COLORS.text, lineHeight: 19 },
  metaRow: { flexDirection: 'row', gap: 6, marginTop: 7, flexWrap: 'wrap' },
  metaTag: { backgroundColor: COLORS.secondary, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  metaText: { fontSize: 11, color: COLORS.primary, fontWeight: '600' },
  removeBtn: { padding: 13 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: COLORS.text },
  emptySub: { fontSize: 14, color: COLORS.textLight, textAlign: 'center', marginTop: 8, lineHeight: 20, maxWidth: 260 },
  exploreBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 26, paddingVertical: 13, borderRadius: 13, marginTop: 22 },
  exploreBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
