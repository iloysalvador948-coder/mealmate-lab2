# Laboratory 2 – API Quest: Reflection
## ITMSD 3 | MealMate – Recipe Finder App

---

## What API Did You Use?

For this laboratory, I used **TheMealDB API** (https://www.themealdb.com/api/json/v1/1/), a completely free and public RESTful API that provides a comprehensive database of meal recipes, ingredients, categories, and cooking instructions from cuisines around the world.

I used the following API endpoints throughout the app:

- **`/random.php`** – Fetches a random meal for the "Recipe of the Day" feature on the Home screen
- **`/categories.php`** – Returns all available meal categories with thumbnail images
- **`/search.php?s={query}`** – Searches meals by name, powering the search functionality on the Explore screen
- **`/filter.php?c={category}`** – Filters meals by a specific category (Chicken, Beef, Seafood, etc.)
- **`/lookup.php?i={id}`** – Retrieves the full details of a specific meal by its ID, including all 20 ingredient/measure fields and the full cooking instructions

The API requires no authentication key in its free tier, making it an ideal choice for a mobile lab project focused on API integration fundamentals.

---

## What Problem Does Your App Solve?

**MealMate** solves a common everyday problem: *"What should I cook today, and how do I make it?"*

Many people open their fridge, see ingredients, and have no idea how to turn them into a satisfying meal. Searching Google often leads to cluttered, ad-heavy websites. MealMate provides a focused, clean mobile experience where users can:

1. **Discover** new recipes daily through the featured "Recipe of the Day"
2. **Search** for specific dishes by name (e.g., "chicken tikka masala")
3. **Browse** recipes by category (Chicken, Beef, Vegetarian, Pasta, Dessert, etc.)
4. **Follow** step-by-step cooking instructions in a clear, numbered format
5. **Save** their favorite recipes for offline reference
6. **Watch** video tutorials directly from YouTube via integrated links

The app transforms raw JSON data from TheMealDB into a visually appealing, card-based interface with meaningful filtering and search, making it genuinely useful rather than just a technical demo.

---

## What Was the Most Difficult Part of the Integration?

The most technically challenging part was **handling the nested, non-standard data structure of the TheMealDB API's ingredient and measurement fields**.

TheMealDB stores ingredients in a flat, indexed format instead of a proper array. A single meal object contains 40 separate fields like `strIngredient1`, `strIngredient2`, ... `strIngredient20`, and a corresponding `strMeasure1`, `strMeasure2`, ... `strMeasure20`. Many of these fields are empty strings or `null`, meaning I had to dynamically loop through all 20 pairs and filter out the empty ones:

```javascript
function extractIngredients(meal) {
  const ingredients = [];
  for (let i = 1; i <= 20; i++) {
    const ingredient = meal[`strIngredient${i}`];
    const measure = meal[`strMeasure${i}`];
    if (ingredient && ingredient.trim()) {
      ingredients.push({
        id: i,
        ingredient: ingredient.trim(),
        measure: measure ? measure.trim() : '',
      });
    }
  }
  return ingredients;
}
```

A second challenge was **managing two types of navigation to the detail screen**. Some screens (Home) already have the full meal object from their API call and pass it directly. Others (Explore's grid) only have the meal ID from the filter endpoint, and must trigger a second `lookup.php` API call on the detail screen. Handling this conditional fetching with `useEffect` and proper loading/error states required careful state management.

Finally, **coordinating multiple simultaneous API calls** on the Home screen (random meal + categories + trending) using `Promise.all()` while still gracefully handling partial failures added complexity to the error handling logic.

---

## What Would You Improve With More Time?

Given more time, I would make the following improvements:

**1. Persistent Favorites with AsyncStorage**
Currently, favorites are stored using a global JavaScript variable (`global.favorites`), which is lost when the app restarts. I would replace this with `AsyncStorage` from `@react-native-async-storage/async-storage` to persist saved recipes between sessions.

**2. Ingredient-Based Search**
Add a second search mode that lets users type in ingredients they have available (e.g., "chicken, garlic, lemon") and returns recipes that use those ingredients. TheMealDB provides a `filter.php?i={ingredient}` endpoint for this.

**3. Offline Mode and Caching**
Implement a caching layer so previously viewed recipes are available offline. React Query or a simple cache with timestamps would greatly improve the user experience on slow connections.

**4. Nutrition Information**
Integrate a secondary API like the USDA FoodData Central API or Edamam API to display approximate calorie counts and macronutrient breakdowns per recipe.

**5. Meal Planning Feature**
Allow users to add recipes to a weekly meal planner and auto-generate a combined shopping list of all required ingredients, grouped by category.

**6. Improved Category Browsing**
The current category chips on the Explore screen only cover 8 categories. A full category browser with all 14 TheMealDB categories and meal counts per category would make discovery more comprehensive.

**7. UI Animations**
Add smooth transitions using `react-native-reanimated` — such as a parallax scroll effect on the recipe detail hero image and animated ingredient list items entering from the side.
