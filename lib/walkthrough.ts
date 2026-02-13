import AsyncStorage from '@react-native-async-storage/async-storage';

const WALKTHROUGH_KEY = '@diyaa_walkthrough_completed';

type Listener = () => void;
const listeners: Listener[] = [];

export function onWalkthroughReset(fn: Listener) {
  listeners.push(fn);
  return () => {
    const idx = listeners.indexOf(fn);
    if (idx >= 0) listeners.splice(idx, 1);
  };
}

export async function resetWalkthrough() {
  await AsyncStorage.removeItem(WALKTHROUGH_KEY);
  listeners.forEach((fn) => fn());
}

export async function isWalkthroughCompleted(): Promise<boolean> {
  const value = await AsyncStorage.getItem(WALKTHROUGH_KEY);
  return value === 'true';
}

export async function completeWalkthrough() {
  await AsyncStorage.setItem(WALKTHROUGH_KEY, 'true');
}
