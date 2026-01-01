// app/(tabs)/_layout.tsx
import { Tabs } from "expo-router";
import { View } from "react-native";
import { Home, Search, Plus, Settings, User } from "lucide-react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#09090b", // zinc-950
          borderTopWidth: 1,
          borderTopColor: "#27272a", // zinc-800
          height: 84, // Taller, modern look
          paddingTop: 8,
        },
        tabBarActiveTintColor: "#fff",
        tabBarInactiveTintColor: "#52525b", // zinc-600
        tabBarShowLabel: false, // Icon-only look (cleaner)
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color }) => <Home size={24} color={color} />,
        }}
      />
      
      {/* Search Tab */}
      <Tabs.Screen
        name="search"
        options={{
          tabBarIcon: ({ color }) => <Search size={24} color={color} />,
        }}
      />

      {/* The "Add" Button (Center) */}
      <Tabs.Screen
        name="add"
        options={{
          tabBarIcon: () => (
            <View className="h-12 w-12 items-center justify-center rounded-full bg-indigo-500 shadow-lg shadow-indigo-500/40">
              <Plus size={26} color="white" />
            </View>
          ),
          // We might want this to open a modal later
        //   presentation: 'modal'
        }}
        listeners={() => ({
          tabPress: (e) => {
            // Optional: Prevent default navigation if you want to open a custom modal here
          },
        })}
      />

      {/* Placeholder Tabs for spacing */}
      <Tabs.Screen
        name="settings"
        options={{
          tabBarIcon: ({ color }) => <Settings size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}