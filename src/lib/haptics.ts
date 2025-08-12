// src/lib/haptics.ts
export const hapticFeedback = {
  light: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  },
  
  selection: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(20);
    }
  }
};