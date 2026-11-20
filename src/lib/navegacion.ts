import { router } from 'expo-router';

// Si la pantalla se abrió por deep link y no hay a dónde volver, se va al Catálogo.
export function volver(): void {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace('/');
  }
}
