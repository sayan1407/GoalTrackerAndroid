import AsyncStorage from '@react-native-async-storage/async-storage';

const GOALS_STORAGE_KEY = 'GOALS_STORAGE_KEY';

/**
 * @typedef {Object} Goal
 * @property {string} id
 * @property {string} title
 * @property {string} description
 * @property {'todo' | 'in-progress' | 'done'} status
 * @property {'day' | 'month' | 'year'} type
 * @property {string} date - ISO string for the specific day, month or year start
 * @property {string} createdAt - ISO string
 */

export const getGoals = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(GOALS_STORAGE_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) {
    console.error('Error fetching goals', e);
    return [];
  }
};

export const saveGoal = async (goal) => {
  try {
    const currentGoals = await getGoals();
    const newGoals = [...currentGoals, { ...goal, id: goal.id || Date.now().toString(), createdAt: new Date().toISOString() }];
    await AsyncStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(newGoals));
    return newGoals;
  } catch (e) {
    console.error('Error saving goal', e);
    return null;
  }
};

export const updateGoal = async (updatedGoal) => {
  try {
    const currentGoals = await getGoals();
    const newGoals = currentGoals.map((g) => (g.id === updatedGoal.id ? updatedGoal : g));
    await AsyncStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(newGoals));
    return newGoals;
  } catch (e) {
    console.error('Error updating goal', e);
    return null;
  }
};

export const deleteGoal = async (id) => {
  try {
    const currentGoals = await getGoals();
    const newGoals = currentGoals.filter((g) => g.id !== id);
    await AsyncStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(newGoals));
    return newGoals;
  } catch (e) {
    console.error('Error deleting goal', e);
    return null;
  }
};

export const rolloverGoal = async (id, newDate) => {
  try {
    const currentGoals = await getGoals();
    const goalToRollover = currentGoals.find((g) => g.id === id);
    if (!goalToRollover) return null;

    const updatedGoal = { ...goalToRollover, date: newDate, status: 'todo' };
    const newGoals = currentGoals.map((g) => (g.id === id ? updatedGoal : g));
    await AsyncStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(newGoals));
    return newGoals;
  } catch (e) {
    console.error('Error rolling over goal', e);
    return null;
  }
};
