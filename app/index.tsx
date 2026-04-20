import { Redirect } from 'expo-router';

export default function Index() {
  // Redirigimos automáticamente a la Home de los tabs
  return <Redirect href="/(tabs)/home" />;
}