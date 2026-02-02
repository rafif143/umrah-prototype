import { persistedState } from './persistedState.svelte.js';
import initialMeals from '../data/meals.json';

// Create a persisted store for Meals Master Data
const mealState = persistedState('umrah_master_meals_config', initialMeals);

export const mealStore = {
    get foodTypes() { return mealState.value?.foodTypes || []; },
    get bases() { return mealState.value?.bases || []; },

    // Food Types Actions
    addFoodType: (item) => {
        mealState.value = { ...mealState.value, foodTypes: [...mealState.value.foodTypes, item] };
    },
    updateFoodType: (id, updatedItem) => {
        mealState.value = {
            ...mealState.value,
            foodTypes: mealState.value.foodTypes.map(i => i.id === id ? { ...i, ...updatedItem } : i)
        };
    },
    deleteFoodType: (id) => {
        mealState.value = {
            ...mealState.value,
            foodTypes: mealState.value.foodTypes.filter(i => i.id !== id)
        };
    },

    // Basis Actions
    addBasis: (item) => {
        mealState.value = { ...mealState.value, bases: [...mealState.value.bases, item] };
    },
    updateBasis: (id, updatedItem) => {
        mealState.value = {
            ...mealState.value,
            bases: mealState.value.bases.map(i => i.id === id ? { ...i, ...updatedItem } : i)
        };
    },
    deleteBasis: (id) => {
        mealState.value = {
            ...mealState.value,
            bases: mealState.value.bases.filter(i => i.id !== id)
        };
    },

    reset: () => {
        mealState.value = initialMeals;
    }
};
