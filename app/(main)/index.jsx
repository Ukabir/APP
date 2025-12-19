import { View } from "react-native";
import PostsViewer from "./../../components/PostViewer";

export default function HomePage() {
  return (
    <View className="flex-1 bg-gradient-to-br from-pink-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950 ">
      {/* Glowing background blobs */}
      <View className="absolute top-10 left-10 w-48 h-48 bg-pink-300 dark:bg-pink-700 opacity-20 rounded-full blur-3xl" />
      <View className="absolute bottom-10 right-10 w-56 h-56 bg-indigo-300 dark:bg-indigo-700 opacity-20 rounded-full blur-3xl" />
      <PostsViewer />
    </View>
  );
}
