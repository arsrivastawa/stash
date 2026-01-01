// app/(tabs)/index.tsx
import { View, Text, FlatList, Pressable } from "react-native";
import { Link2, Clock, MoreHorizontal } from "lucide-react-native";

// Mock Data
const MOCK_STASH = [
  { id: "1", title: "Supabase Auth Helpers", type: "github", date: "2h ago" },
  { id: "2", title: "Linear - A better way to build products", type: "website", date: "5h ago" },
  { id: "3", title: "Why React Native is the future", type: "article", date: "1d ago" },
];

export default function HomeScreen() {
  return (
    <View className="flex-1 bg-zinc-950 px-4 pt-14">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-6">
        <View>
          <Text className="text-2xl font-bold text-zinc-100">Inbox</Text>
          <Text className="text-sm text-zinc-500">3 new items</Text>
        </View>
        <View className="h-8 w-8 rounded-full bg-zinc-800 items-center justify-center">
           <Text className="text-xs text-zinc-400">AS</Text>
        </View>
      </View>

      {/* The List */}
      <FlatList
        data={MOCK_STASH}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable 
            className="mb-3 group active:scale-[0.98] transition-all"
          >
            <View className="flex-row overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4">
              
              {/* Icon / Image Placeholder */}
              <View className="h-12 w-12 items-center justify-center rounded-xl bg-zinc-800/50 border border-zinc-700/30">
                <Link2 size={20} color="#a1a1aa" />
              </View>

              {/* Text Content */}
              <View className="ml-3 flex-1 justify-center space-y-1">
                <Text className="font-medium text-zinc-100 text-[15px] leading-tight" numberOfLines={1}>
                  {item.title}
                </Text>
                <View className="flex-row items-center gap-2">
                   <Text className="text-xs text-zinc-500 capitalize">{item.type}</Text>
                   <View className="h-0.5 w-0.5 rounded-full bg-zinc-700" />
                   <View className="flex-row items-center gap-1">
                     <Clock size={10} color="#52525b" />
                     <Text className="text-xs text-zinc-500">{item.date}</Text>
                   </View>
                </View>
              </View>

              {/* Action Dot */}
              <View className="justify-center pl-2">
                 <MoreHorizontal size={16} color="#52525b" />
              </View>

            </View>
          </Pressable>
        )}
      />
    </View>
  );
}