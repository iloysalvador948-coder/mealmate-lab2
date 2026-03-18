import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, ActivityIndicator, RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../constants';

const API_BASE = 'https://www.themealdb.com/api/json/v1/1';

export default function HomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [featuredMeal, setFeaturedMeal] = useState(null);
  const [categories, setCategories] = useState([]);
  const [trendingMeals, setTrendingMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const loadData = async () => {
    try {
      setError(null);
      const [mealRes, catRes] = await Promise.all([
        fetch(`${API_BASE}/random.php`),
        fetch(`${API_BASE}/categories.php`),
      ]);
      const mealData = await mealRes.json();
      const catData = await catRes.json();
      setFeaturedMeal(mealData.meals[0]);
      setCategories(catData.categories.slice(0, 6));
      const trendRes = await fetch(`${API_BASE}/filter.php?c=Chicken`);
      const trendData = await trendRes.json();
      setTrendingMeals(trendData.meals ? trendData.meals.slice(0, 6) : []);
    } catch (err) {
      setError('Could not load recipes. Check your internet connection.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { loadData(); }, []);
  const onRefresh = () => { setRefreshing(true); loadData(); };

  if (loading) {
    return (
      <View style={[styles.center, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading delicious recipes... 🍳</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.center, { paddingTop: insets.top }]}>
        <Text style={{ fontSize: 56 }}>📡</Text>
        <Text style={styles.errorTitle}>No Connection</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={loadData}>
          <Text style={styles.retryText}>🔄 Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingTop: insets.top }}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, Food Lover! 👋</Text>
          <Text style={styles.appTitle}>MealMate</Text>
          <Text style={styles.appSubtitle}>Discover amazing recipes worldwide</Text>
        </View>
        <TouchableOpacity style={styles.searchIconBtn} onPress={() => navigation.navigate('Explore')}>
          <Text style={{ fontSize: 20 }}>🔍</Text>
        </TouchableOpacity>
      </View>

      {/* Recipe of the Day */}
      {featuredMeal && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>✨ Recipe of the Day</Text>
          <TouchableOpacity
            style={styles.featuredCard}
            onPress={() => navigation.navigate('RecipeDetail', { meal: featuredMeal })}
            activeOpacity={0.9}
          >
            <Image source={{ uri: featuredMeal.strMealThumb }} style={styles.featuredImage} />
            <View style={styles.featuredOverlay}>
              <View style={styles.badge}><Text style={styles.badgeText}>⭐ Featured</Text></View>
              <Text style={styles.featuredCategory}>{featuredMeal.strCategory}</Text>
              <Text style={styles.featuredTitle}>{featuredMeal.strMeal}</Text>
              <Text style={{ color: '#fff', fontSize: 12, marginTop: 5 }}>
                🌍 {featuredMeal.strArea || 'International'} Cuisine  ➜
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      )}

      {/* Categories */}
      <View style={styles.section}>
        <View style={styles.rowBetween}>
          <Text style={styles.sectionTitle}>🍽️ Categories</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Explore')}>
            <Text style={styles.seeAll}>See All →</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.idCategory}
              style={styles.catCard}
              onPress={() => navigation.navigate('Explore', { selectedCategory: cat.strCategory })}
            >
              <Image source={{ uri: cat.strCategoryThumb }} style={styles.catImage} />
              <View style={styles.catOverlay} />
              <Text style={styles.catName}>{cat.strCategory}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Trending */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔥 Trending Chicken Recipes</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {trendingMeals.map((meal) => (
            <TouchableOpacity
              key={meal.idMeal}
              style={styles.trendCard}
              onPress={() => navigation.navigate('RecipeDetail', { mealId: meal.idMeal })}
            >
              <Image source={{ uri: meal.strMealThumb }} style={styles.trendImage} />
              <View style={styles.trendInfo}>
                <Text style={styles.trendName} numberOfLines={2}>{meal.strMeal}</Text>
                <Text style={{ fontSize: 11, color: COLORS.primary, fontWeight: '600', marginTop: 4 }}>🔥 Popular</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Tip */}
      <View style={styles.tip}>
        <Text style={{ fontSize: 18 }}>💡</Text>
        <Text style={styles.tipText}>Pull down to refresh and get a new Recipe of the Day!</Text>
      </View>
      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background, padding: 32 },
  loadingText: { marginTop: 14, color: COLORS.textLight, fontSize: 15 },
  errorTitle: { fontSize: 20, fontWeight: '700', color: COLORS.text, marginTop: 14 },
  errorText: { fontSize: 14, color: COLORS.textLight, textAlign: 'center', marginTop: 6, lineHeight: 20 },
  retryBtn: { marginTop: 20, backgroundColor: COLORS.primary, paddingHorizontal: 30, paddingVertical: 12, borderRadius: 12 },
  retryText: { color: COLORS.white, fontWeight: '700', fontSize: 15 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  greeting: { fontSize: 13, color: COLORS.textLight },
  appTitle: { fontSize: 28, fontWeight: '800', color: COLORS.primary, marginTop: 2 },
  appSubtitle: { fontSize: 13, color: COLORS.textLight, marginTop: 2 },
  searchIconBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.secondary, justifyContent: 'center', alignItems: 'center', marginTop: 8, borderWidth: 1.5, borderColor: COLORS.border },
  section: { paddingHorizontal: 20, marginTop: 20 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: COLORS.text, marginBottom: 12 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  seeAll: { fontSize: 13, color: COLORS.primary, fontWeight: '600' },
  featuredCard: { borderRadius: 18, overflow: 'hidden', height: 230 },
  featuredImage: { width: '100%', height: '100%' },
  featuredOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 14, backgroundColor: 'rgba(0,0,0,0.6)' },
  badge: { backgroundColor: COLORS.primary, alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20, marginBottom: 5 },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  featuredCategory: { color: COLORS.accent, fontSize: 11, fontWeight: '600', textTransform: 'uppercase' },
  featuredTitle: { color: '#fff', fontSize: 19, fontWeight: '800', marginTop: 2 },
  catCard: { width: 95, height: 75, borderRadius: 14, overflow: 'hidden', marginRight: 10 },
  catImage: { width: '100%', height: '100%' },
  catOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.38)' },
  catName: { position: 'absolute', bottom: 6, left: 0, right: 0, textAlign: 'center', color: '#fff', fontSize: 11, fontWeight: '700' },
  trendCard: { width: 138, backgroundColor: COLORS.card, borderRadius: 14, marginRight: 12, overflow: 'hidden', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4 },
  trendImage: { width: '100%', height: 95 },
  trendInfo: { padding: 9 },
  trendName: { fontSize: 12, fontWeight: '600', color: COLORS.text, lineHeight: 17 },
  tip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF8F0', marginHorizontal: 20, marginTop: 20, padding: 13, borderRadius: 13, borderLeftWidth: 4, borderLeftColor: COLORS.accent, gap: 9 },
  tipText: { fontSize: 12, color: COLORS.textLight, flex: 1, lineHeight: 17 },
});
