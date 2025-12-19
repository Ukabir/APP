import { View } from "react-native";
import { Text } from "./../../components/Text";

export default function AboutScreen() {
  return (
    <View className="flex-1 items-center justify-center px-6 py-16 bg-gradient-to-br from-pink-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950 relative overflow-hidden">
      
      {/* Glowing background */}
      <View className="absolute top-10 left-10 w-48 h-48 bg-pink-300 dark:bg-pink-700 opacity-20 rounded-full blur-3xl" />
      <View className="absolute bottom-10 right-10 w-56 h-56 bg-indigo-300 dark:bg-indigo-700 opacity-20 rounded-full blur-3xl" />

      <View className="max-w-xl w-full items-center">
        <Text className="text-3xl font-bold mb-5 text-gray-900 dark:text-gray-100 text-center">
          About Oreblogda
        </Text>

        <Text className="text-base leading-6 text-gray-700 dark:text-gray-300 mb-4 text-center">
          Welcome to{" "}
          <Text className="font-semibold text-indigo-600 dark:text-indigo-400">
            Oreblogda
          </Text>{" "}
          — your chill corner for everything anime, manga, and otaku culture! 🎌{"\n\n"}
          From the latest news and episode breakdowns to fun facts and underrated
          recommendations, we keep you updated on what’s hot in the anime world.
        </Text>

        <Text className="text-base leading-6 text-gray-700 dark:text-gray-300 mb-4 text-center">
          Whether you’re deep into shōnen battles, slice-of-life stories, or just
          here for the memes — we’ve got you covered. Our mission is simple: to
          make anime news fun, honest, and worth your time.
        </Text>

        <Text className="text-base leading-6 text-gray-700 dark:text-gray-300 text-center">
          We’re fans first — writers second.{"\n"}
          So grab your snacks 🍿, power up your Wi-Fi, and join the Oreblogda
          community.{"\n"}
          Stay tuned, stay hyped, and never skip the opening song!
        </Text>
      </View>
    </View>
  );
}
