import { ScrollView, View } from "react-native";
import { Text } from "./../../components/Text";

export default function TermsAndConditions() {
  return (
    <ScrollView
      className="flex-1 bg-gradient-to-br from-blue-50 via-white to-pink-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950"
      contentContainerStyle={{ paddingVertical: 48, paddingHorizontal: 24 }}
    >
      {/* Subtle anime glow background */}
      <View className="absolute top-10 left-10 w-48 h-48 bg-blue-300 dark:bg-indigo-700 opacity-20 rounded-full blur-3xl" />
      <View className="absolute bottom-10 right-10 w-56 h-56 bg-pink-300 dark:bg-pink-700 opacity-20 rounded-full blur-3xl" />

      <View
        style={{ maxWidth: 768, width: "100%", alignSelf: "center" }}
        className="relative z-10"
      >
        <Text className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100 text-center">
          Terms & Conditions
        </Text>

        <Text className="text-gray-700 dark:text-gray-300 mb-8 text-center">
          Welcome to{" "}
          <Text className="font-semibold text-indigo-600 dark:text-indigo-400">
            Oreblogda
          </Text>
          ! By using this app, you agree to the following simple terms.
        </Text>

        <Text className="text-xl font-semibold text-gray-900 dark:text-gray-100 mt-4 mb-2">
          1. Content & Use
        </Text>
        <Text className="text-gray-700 dark:text-gray-300 mb-5">
          All posts, articles, and media on Oreblogda are for entertainment and
          informational purposes only. Please enjoy, share, and discuss — but
          don’t copy or repost our content without credit.
        </Text>

        <Text className="text-xl font-semibold text-gray-900 dark:text-gray-100 mt-4 mb-2">
          2. User Conduct
        </Text>
        <Text className="text-gray-700 dark:text-gray-300 mb-5">
          Be respectful when commenting or engaging with our content. We don’t
          tolerate spam, hate speech, or harmful behavior. Violating this may
          result in comment or account removal.
        </Text>

        <Text className="text-xl font-semibold text-gray-900 dark:text-gray-100 mt-4 mb-2">
          3. External Links
        </Text>
        <Text className="text-gray-700 dark:text-gray-300 mb-5">
          Sometimes we share links to other websites or anime sources. We’re not
          responsible for their content or privacy practices — browse
          responsibly.
        </Text>

        <Text className="text-xl font-semibold text-gray-900 dark:text-gray-100 mt-4 mb-2">
          4. Updates
        </Text>
        <Text className="text-gray-700 dark:text-gray-300 mb-8">
          These terms might change occasionally as Oreblogda grows. We’ll always
          keep the latest version available here.
        </Text>

        <Text className="text-gray-700 dark:text-gray-300">
          If you have questions or concerns, contact us at{" "}
          <Text className="font-semibold text-indigo-600 dark:text-indigo-400">
            oreblogda@gmail.com
          </Text>
          .
        </Text>
      </View>
    </ScrollView>
  );
}
