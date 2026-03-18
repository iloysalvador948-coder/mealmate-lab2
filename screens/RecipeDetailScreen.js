import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Image,
  TouchableOpacity, ActivityIndicator, Linking, Share,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../constants';

const API_BASE = 'https://www.themealdb.com/api/json/v1/1';

function extractIngredients(meal) {
  const list = [];
  for (let i = 1; i <= 20; i++) {
    const ing = meal[`strIngredient${i}`];
    const mea = meal[`strMeasure${i}`];
    if (ing && ing.trim()) list.push({ id: i, name: ing.trim(), measure: mea ? mea.trim() : '' });
  }
  return list;
}

export default function RecipeDetailScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { meal: initialMeal, mealId } = route.params || {};
  const [meal, setMeal] = useState(initialMeal || null);
  const [loading, setLoading] = useState(!initialMeal && !!mealId);
  const [error, setError] = useState(null);
  const [isFav, setIsFav] = useState(false);
  const [activeTab, setActiveTab] = useState('ingredients');

  useEffect(() => {
    if (!initialMeal && mealId) {
      fetch(`${API_BASE}/lookup.php?i=${mealId}`)
        .then(r => r.json())
        .then(d => {
          if (!d.meals) throw new Error('Not found');
          setMeal(d.meals[0]);
          setIsFav(global.favorites?.has(d.meals[0].idMeal) || false);
        })
        .catch(() => setError('Could not load this recipe.'))
        .finally(() => setLoading(false));
    } else if (initialMeal) {
      setIsFav(global.favorites?.has(initialMeal.idMeal) || false);
    }
  }, []);

  const toggleFav = () => {
    if (!meal) return;
    if (!global.favorites) global.favorites = new Set();
    if (!global.favoriteMeals) global.favoriteMeals = {};
    if (isFav) {
      global.favorites.delete(meal.idMeal);
    } else {
      global.favorites.add(meal.idMeal);
      global.favoriteMeals[meal.idMeal] = meal;
    }
    setIsFav(!isFav);
  };

  const shareRecipe = () => {
    if (!meal) return;
    Share.share({ message: `Check out this recipe: ${meal.strMeal}\nCategory: ${meal.strCategory} | Cuisine: ${meal.strArea}` });
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={{ color: COLORS.textLight, marginTop: 12 }}>Loading recipe... 🍽️</Text>
      </View>
    );
  }

  if (error || !meal) {
    return (
      <View style={styles.center}>
        <Text style={{ fontSize: 56 }}>😕</Text>
        <Text style={styles.errTitle}>Recipe Not Found</Text>
        <Text style={styles.errText}>{error}</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>← Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const ingredients = extractIngredients(meal);
  const steps = meal.strInstructions
    ? meal.strInstructions.split('\n').filter(l => l.trim().length > 2).map((l, i) => ({ id: i, text: l.trim() }))
    : [];

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={{ height: 280 }}>
          <Image source={{ uri: meal.strMealThumb }} style={{ width: '100%', height: '100%' }} />
          <TouchableOpacity style={[styles.floatBtn, { top: insets.top + 10, left: 16 }]} onPress={() => navigation.goBack()}>
            <Text style={{ fontSize: 18 }}>←</Text>
          </TouchableOpacity>
          <View style={[styles.floatRow, { top: insets.top + 10, right: 16 }]}>
            <TouchableOpacity style={styles.floatBtn} onPress={shareRecipe}>
              <Text style={{ fontSize: 16 }}>↗️</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.floatBtn, isFav && { backgroundColor: 'rgba(255,255,255,0.95)' }]} onPress={toggleFav}>
              <Text style={{ fontSize: 16 }}>{isFav ? '❤️' : '🤍'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.tagRow}>
            <View style={styles.tag}><Text style={styles.tagText}>🍽️ {meal.strCategory}</Text></View>
            <View style={styles.tag}><Text style={styles.tagText}>🌍 {meal.strArea || 'International'}</Text></View>
          </View>
          <Text style={styles.mealTitle}>{meal.strMeal}</Text>
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={{ fontSize: 22 }}>🧅</Text>
              <Text style={styles.statVal}>{ingredients.length}</Text>
              <Text style={styles.statLbl}>Ingredients</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.stat}>
              <Text style={{ fontSize: 22 }}>📋</Text>
              <Text style={styles.statVal}>{steps.length}</Text>
              <Text style={styles.statLbl}>Steps</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.stat}>
              <Text style={{ fontSize: 22 }}>⭐</Text>
              <Text style={styles.statVal}>4.8</Text>
              <Text style={styles.statLbl}>Rating</Text>
            </View>
          </View>
          {meal.strYoutube && (
            <TouchableOpacity style={styles.ytBtn} onPress={() => Linking.openURL(meal.strYoutube)}>
              <Text style={styles.ytBtnText}>▶  Watch Video Tutorial</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Tabs */}
        <View style={styles.tabRow}>
          <TouchableOpacity style={[styles.tab, activeTab === 'ingredients' && styles.tabActive]} onPress={() => setActiveTab('ingredients')}>
            <Text style={[styles.tabText, activeTab === 'ingredients' && styles.tabTextActive]}>🧅 Ingredients</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tab, activeTab === 'instructions' && styles.tabActive]} onPress={() => setActiveTab('instructions')}>
            <Text style={[styles.tabText, activeTab === 'instructions' && styles.tabTextActive]}>📋 Instructions</Text>
          </TouchableOpacity>
        </View>

        {/* Ingredients */}
        {activeTab === 'ingredients' && (
          <View style={styles.content}>
            <Text style={styles.contentNote}>{ingredients.length} ingredients needed</Text>
            {ingredients.map(item => (
              <View key={item.id} style={styles.ingRow}>
                <View style={styles.ingBullet}><Text style={{ color: COLORS.primary, fontWeight: '700', fontSize: 13 }}>✓</Text></View>
                <Text style={styles.ingName}>{item.name}</Text>
                {item.measure ? <Text style={styles.ingMeasure}>{item.measure}</Text> : null}
              </View>
            ))}
          </View>
        )}

        {/* Instructions */}
        {activeTab === 'instructions' && (
          <View style={styles.content}>
            <Text style={styles.contentNote}>{steps.length} steps to follow</Text>
            {steps.map((step, idx) => (
              <View key={step.id} style={styles.stepCard}>
                <View style={styles.stepNum}><Text style={{ color: '#fff', fontWeight: '800', fontSize: 12 }}>{idx + 1}</Text></View>
                <Text style={styles.stepText}>{step.text}</Text>
              </View>
            ))}
          </View>
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background, padding: 32 },
  errTitle: { fontSize: 20, fontWeight: '700', color: COLORS.text, marginTop: 12 },
  errText: { fontSize: 14, color: COLORS.textLight, textAlign: 'center', marginTop: 6 },
  backBtn: { marginTop: 20, backgroundColor: COLORS.primary, paddingHorizontal: 28, paddingVertical: 12, borderRadius: 12 },
  backBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  floatBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', alignItems: 'center' },
  floatRow: { position: 'absolute', flexDirection: 'row', gap: 8 },
  infoCard: { backgroundColor: COLORS.white, marginHorizontal: 16, marginTop: -18, borderRadius: 20, padding: 18, elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.1, shadowRadius: 8 },
  tagRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  tag: { backgroundColor: COLORS.secondary, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  tagText: { fontSize: 12, color: COLORS.primary, fontWeight: '600' },
  mealTitle: { fontSize: 21, fontWeight: '800', color: COLORS.text, lineHeight: 27, marginBottom: 14 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: COLORS.background, borderRadius: 14, padding: 13, marginBottom: 13 },
  stat: { alignItems: 'center', gap: 3 },
  statVal: { fontSize: 17, fontWeight: '800', color: COLORS.text },
  statLbl: { fontSize: 11, color: COLORS.textLight },
  divider: { width: 1, backgroundColor: COLORS.border },
  ytBtn: { backgroundColor: '#FF0000', borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  ytBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  tabRow: { flexDirection: 'row', marginHorizontal: 16, marginTop: 18, backgroundColor: COLORS.white, borderRadius: 14, padding: 4, elevation: 2 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 12 },
  tabActive: { backgroundColor: COLORS.primary },
  tabText: { fontSize: 14, fontWeight: '600', color: COLORS.textLight },
  tabTextActive: { color: '#fff' },
  content: { paddingHorizontal: 16, paddingTop: 14 },
  contentNote: { fontSize: 13, color: COLORS.textLight, marginBottom: 12, fontStyle: 'italic' },
  ingRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, borderRadius: 12, padding: 11, marginBottom: 7, gap: 10, elevation: 1 },
  ingBullet: { width: 30, height: 30, borderRadius: 15, backgroundColor: COLORS.secondary, justifyContent: 'center', alignItems: 'center' },
  ingName: { flex: 1, fontSize: 14, fontWeight: '600', color: COLORS.text },
  ingMeasure: { fontSize: 13, color: COLORS.primary, fontWeight: '600' },
  stepCard: { flexDirection: 'row', backgroundColor: COLORS.white, borderRadius: 13, padding: 13, marginBottom: 9, gap: 11, elevation: 1 },
  stepNum: { width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', flexShrink: 0, marginTop: 2 },
  stepText: { flex: 1, fontSize: 14, color: COLORS.text, lineHeight: 21 },
});
