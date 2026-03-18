import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, FlatList,
  TouchableOpacity, Image, ActivityIndicator, ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../constants';

const API_BASE = 'https://www.themealdb.com/api/json/v1/1';

const CATEGORIES = [
  { id: 'Chicken', name: 'Chicken', icon: '🍗' },
  { id: 'Beef', name: 'Beef', icon: '🥩' },
  { id: 'Seafood', name: 'Seafood', icon: '🦐' },
  { id: 'Vegetarian', name: 'Veggie', icon: '🥦' },
  { id: 'Pasta', name: 'Pasta', icon: '🍝' },
  { id: 'Dessert', name: 'Dessert', icon: '🍰' },
  { id: 'Breakfast', name: 'Breakfast', icon: '🥞' },
  { id: 'Lamb', name: 'Lamb', icon: '🍖' },
];

export default function ExploreScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Chicken');
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSearch, setIsSearch] = useState(false);

  useEffect(() => {
    const cat = route.params?.selectedCategory || 'Chicken';
    setSelectedCategory(cat);
    fetchByCategory(cat);
  }, [route.params?.selectedCategory]);

  const fetchByCategory = async (cat) => {
    try {
      setLoading(true); setError(null); setIsSearch(false);
      const res = await fetch(`${API_BASE}/filter.php?c=${cat}`);
      const data = await res.json();
      setMeals(data.meals || []);
    } catch { setError('Failed to load. Check your connection.'); }
    finally { setLoading(false); }
  };

  const searchMeals = async () => {
    if (!searchQuery.trim()) return;
    try {
      setLoading(true); setError(null); setIsSearch(true);
      const res = await fetch(`${API_BASE}/search.php?s=${encodeURIComponent(searchQuery.trim())}`);
      const data = await res.json();
      setMeals(data.meals || []);
    } catch { setError('Search failed. Check your connection.'); }
    finally { setLoading(false); }
  };

  const handleCategory = (cat) => {
    setSelectedCategory(cat);
    setSearchQuery('');
    fetchByCategory(cat);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setIsSearch(false);
    fetchByCategory(selectedCategory);
  };

  const renderMeal = ({ item }) => (
    <TouchableOpacity
      style={styles.mealCard}
      onPress={() => navigation.navigate('RecipeDetail', { mealId: item.idMeal })}
      activeOpacity={0.85}
    >
      <Image source={{ uri: item.strMealThumb }} style={styles.mealImage} />
      <View style={styles.mealInfo}>
        <Text style={styles.mealName} numberOfLines={2}>{item.strMeal}</Text>
        <Text style={{ fontSize: 11, color: COLORS.primary, marginTop: 5 }}>Tap to view →</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🔍 Explore Recipes</Text>
        <Text style={styles.headerSub}>Search or browse by category</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchRow}>
        <View style={styles.searchBar}>
          <Text style={{ fontSize: 16 }}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search recipes (e.g. pasta, chicken)..."
            placeholderTextColor={COLORS.textLight}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={searchMeals}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={clearSearch}>
              <Text style={{ fontSize: 16 }}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity style={styles.searchBtn} onPress={searchMeals}>
          <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13 }}>GO</Text>
        </TouchableOpacity>
      </View>

      {/* Category Chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ maxHeight: 50, marginBottom: 4 }} contentContainerStyle={{ paddingHorizontal: 14, alignItems: 'center' }}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={[styles.chip, selectedCategory === cat.id && !isSearch && styles.chipActive]}
            onPress={() => handleCategory(cat.id)}
          >
            <Text style={styles.chipIcon}>{cat.icon}</Text>
            <Text style={[styles.chipText, selectedCategory === cat.id && !isSearch && styles.chipTextActive]}>
              {cat.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Count */}
      {!loading && meals.length > 0 && (
        <Text style={styles.countText}>
          {isSearch ? `${meals.length} results for "${searchQuery}"` : `${meals.length} ${selectedCategory} recipes`}
        </Text>
      )}

      {loading && (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={{ color: COLORS.textLight, marginTop: 10 }}>Finding recipes... 🍽️</Text>
        </View>
      )}

      {error && !loading && (
        <View style={styles.center}>
          <Text style={{ fontSize: 48 }}>⚠️</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => fetchByCategory(selectedCategory)}>
            <Text style={styles.retryText}>🔄 Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {!loading && !error && (
        <FlatList
          data={meals}
          renderItem={renderMeal}
          keyExtractor={(item) => item.idMeal}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={{ justifyContent: 'space-between', marginBottom: 12 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={{ fontSize: 48, marginBottom: 12 }}>🔍</Text>
              <Text style={{ fontSize: 18, fontWeight: '700', color: COLORS.text }}>No Results</Text>
              <Text style={{ color: COLORS.textLight, marginTop: 6, textAlign: 'center' }}>
                {isSearch ? `No recipes found for "${searchQuery}"` : 'No recipes in this category'}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 6 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: COLORS.text },
  headerSub: { fontSize: 13, color: COLORS.textLight, marginTop: 2 },
  searchRow: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 10, gap: 10, alignItems: 'center' },
  searchBar: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, borderRadius: 14, paddingHorizontal: 12, paddingVertical: 10, gap: 8, borderWidth: 1.5, borderColor: COLORS.border },
  searchInput: { flex: 1, fontSize: 14, color: COLORS.text },
  searchBtn: { width: 50, height: 46, backgroundColor: COLORS.primary, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  chip: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 7, borderWidth: 1.5, borderColor: COLORS.border, gap: 4, marginRight: 8 },
  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipIcon: { fontSize: 13 },
  chipText: { fontSize: 13, fontWeight: '600', color: COLORS.textLight },
  chipTextActive: { color: COLORS.white },
  countText: { paddingHorizontal: 18, paddingBottom: 6, fontSize: 12, color: COLORS.textLight },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  errorText: { color: COLORS.textLight, textAlign: 'center', marginTop: 10 },
  retryBtn: { marginTop: 14, backgroundColor: COLORS.primary, paddingHorizontal: 24, paddingVertical: 11, borderRadius: 12 },
  retryText: { color: COLORS.white, fontWeight: '700' },
  listContent: { paddingHorizontal: 12, paddingBottom: 24 },
  mealCard: { width: '48%', backgroundColor: COLORS.card, borderRadius: 14, overflow: 'hidden', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 4 },
  mealImage: { width: '100%', height: 125 },
  mealInfo: { padding: 9 },
  mealName: { fontSize: 13, fontWeight: '700', color: COLORS.text, lineHeight: 17 },
});
