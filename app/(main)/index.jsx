import { View } from "react-native";
import PostsViewer from "./../../components/PostViewer";

export default function HomePage() {
  return (
    <View className="flex-1 bg-white dark:bg-gray-950 ">
      {/* Glowing background blobs */}
      <PostsViewer />
    </View>
  );
}
