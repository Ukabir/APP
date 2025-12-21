import { usePathname, useRouter } from "expo-router";
import { FlatList, TouchableOpacity, View } from "react-native";
import { Text } from "./Text";
const categories = ["News", "Memes", "Videos/Edits", "Polls", "Review", "Gaming"];

export default function CategoryNav({ isDark }) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <View className="bg-white dark:bg-gray-900 shadow-sm" style={{ height: 55 }}>
  <FlatList
    horizontal
    data={categories}
    keyExtractor={(item) => item}
    showsHorizontalScrollIndicator={false}
    // This prop helps Android not "stale" the touch
    contentContainerStyle={{ 
      paddingHorizontal: 10, 
      alignItems: 'center',
      height: '100%' 
    }}
    // Force the list to be interactive
    scrollEnabled={true}
    // Prevent parent from stealing the touch
    nestedScrollEnabled={true}
    renderItem={({ item }) => {
      const catSlug = item.toLowerCase().replace("/", "-");
      const isActive = pathname.includes(catSlug);
      const displayName = item === "Videos/Edits" ? "Videos" : item;

      return (
        <TouchableOpacity
          onPress={() => router.push(`/categories/${catSlug}`)}
          style={{ marginRight: 8 }}
          className={`px-4 py-2 rounded-md ${
            isActive ? "bg-blue-600" : "bg-gray-200 dark:bg-gray-700"
          }`}
        >
          <Text className={`font-medium ${
            isActive ? "text-white" : "text-gray-800 dark:text-gray-200"
          }`}>
            {displayName}
          </Text>
        </TouchableOpacity>
      );
    }}
  />
</View>
  );
}