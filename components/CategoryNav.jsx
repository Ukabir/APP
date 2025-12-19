import { usePathname, useRouter } from "expo-router";
import { ScrollView, TouchableOpacity, View } from "react-native";
import { Text } from "./Text";
const categories = ["News", "Memes", "Videos/Edits", "Polls", "Review", "Gaming"];

export default function CategoryNav({ isDark }) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <View className="py-2 bg-gray-100 dark:bg-gray-800 shadow-sm">
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 10, gap: 8 }}
      >
        {categories.map((cat) => {
          const catSlug = cat.toLowerCase().replace("/", "-");
          // Check if the current path includes this category
          const isActive = pathname.includes(catSlug);
          const displayName = cat === "Videos/Edits" ? "Videos" : cat;

          return (
            <TouchableOpacity
              key={cat}
              onPress={() => router.push(`/categories/${catSlug}`)}
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
        })}
      </ScrollView>
    </View>
  );
}