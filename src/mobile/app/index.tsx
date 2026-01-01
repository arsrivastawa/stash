import { Redirect } from "expo-router";

export default function Index() {
  // Instantly redirect to the "(tabs)" folder
  return <Redirect href="/(tabs)" />;
}