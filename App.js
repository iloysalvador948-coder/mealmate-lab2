import 'react-native-gesture-handler';
import React from 'react';
import { Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { COLORS } from './constants';

import HomeScreen from './screens/HomeScreen';
import ExploreScreen from './screens/ExploreScreen';
import RecipeDetailScreen from './screens/RecipeDetailScreen';
import FavoritesScreen from './screens/FavoritesScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function TabIcon({ emoji, focused }) {
  return (
    <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.5 }}>{emoji}</Text>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.white,
          borderTopColor: COLORS.border,
          height: 62,
          paddingBottom: 8,
          paddingTop: 4,
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textLight,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarIcon: ({ focused }) => {
          if (route.name === 'Home') return <TabIcon emoji="🏠" focused={focused} />;
          if (route.name === 'Explore') return <TabIcon emoji="🔍" focused={focused} />;
          if (route.name === 'Favorites') return <TabIcon emoji="❤️" focused={focused} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Explore" component={ExploreScreen} />
      <Tab.Screen name="Favorites" component={FavoritesScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="MainTabs" component={MainTabs} />
          <Stack.Screen name="RecipeDetail" component={RecipeDetailScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
