import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';

export function useFocusRefresh(callback: () => void) {
  useFocusEffect(
    useCallback(() => {
      callback();
    }, [callback])
  );
}
