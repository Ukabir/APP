import { ScrollView, View } from "react-native";
import { Text } from "./../../components/Text";
export default function PrivacyPolicy() {
  return (
    <ScrollView
      className="flex-1 bg-gradient-to-br from-blue-50 via-white to-pink-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950"
      contentContainerStyle={{ paddingVertical: 48, paddingHorizontal: 24 }}
    >
      {/* Subtle anime glow */}
      <View className="absolute top-10 left-10 w-48 h-48 bg-blue-300 dark:bg-indigo-700 opacity-20 rounded-full blur-3xl" />
      <View className="absolute bottom-10 right-10 w-56 h-56 bg-pink-300 dark:bg-pink-700 opacity-20 rounded-full blur-3xl" />

      <View className="max-w-3xl w-full self-center">
        <Text className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100 text-center">
          Privacy Policy
        </Text>

        <Text className="text-gray-600 dark:text-gray-400 mb-4">
          Last updated: October 2025
        </Text>

        <Text className="text-gray-700 dark:text-gray-300 mb-6">
          Welcome to{" "}
          <Text className="font-semibold text-indigo-600 dark:text-indigo-400">
            Oreblogda
          </Text>
          ! Your privacy is important to us. This Privacy Policy explains how we
          collect, use, and protect your information when you visit our website.
        </Text>

        <Text className="text-xl font-semibold text-gray-900 dark:text-gray-100 mt-6 mb-2">
          1. Information We Collect
        </Text>
        <Text className="text-gray-700 dark:text-gray-300 mb-5">
          We may collect personal information such as your email address when you
          subscribe to our newsletter. We also collect non-personal data
          automatically, like browser type, device info, and general site usage
          through cookies or analytics tools.
        </Text>

        <Text className="text-xl font-semibold text-gray-900 dark:text-gray-100 mt-6 mb-2">
          2. How We Use Your Information
        </Text>
        <Text className="text-gray-700 dark:text-gray-300 mb-5">
          • To send you updates about new posts, anime news, or special content.
          {"\n"}
          • To improve our website experience and understand what our readers
          enjoy most.{"\n"}
          • To ensure our site remains secure and functional.
        </Text>

        <Text className="text-xl font-semibold text-gray-900 dark:text-gray-100 mt-6 mb-2">
          3. Cookies
        </Text>
        <Text className="text-gray-700 dark:text-gray-300 mb-5">
          We use cookies to personalize content and analyze traffic. You can
          choose to disable cookies in your browser settings, but some parts of
          the site may not function properly without them.
        </Text>

        <Text className="text-xl font-semibold text-gray-900 dark:text-gray-100 mt-6 mb-2">
          4. Sharing of Information
        </Text>
        <Text className="text-gray-700 dark:text-gray-300 mb-5">
          We do not sell or share your personal data with third parties, except
          as required by law or to comply with legal processes.
        </Text>

        <Text className="text-xl font-semibold text-gray-900 dark:text-gray-100 mt-6 mb-2">
          5. Security
        </Text>
        <Text className="text-gray-700 dark:text-gray-300 mb-5">
          We take reasonable measures to protect your personal information.
          However, no method of transmission over the Internet is completely
          secure, so we cannot guarantee absolute security.
        </Text>

        <Text className="text-xl font-semibold text-gray-900 dark:text-gray-100 mt-6 mb-2">
          6. Your Rights
        </Text>
        <Text className="text-gray-700 dark:text-gray-300 mb-5">
          You may request to update or delete your personal data by contacting us
          directly. If you subscribed to our newsletter, you can unsubscribe
          anytime via the link in our emails.
        </Text>

        <Text className="text-xl font-semibold text-gray-900 dark:text-gray-100 mt-6 mb-2">
          7. Updates to This Policy
        </Text>
        <Text className="text-gray-700 dark:text-gray-300 mb-8">
          We may update this Privacy Policy occasionally to reflect changes in
          our practices or for other operational reasons. The date above will
          always show the latest version.
        </Text>

        <Text className="text-gray-700 dark:text-gray-300">
          If you have any questions about this Privacy Policy, please contact us
          at{" "}
          <Text className="font-semibold text-indigo-600 dark:text-indigo-400">
            oreblogda@gmail.com
          </Text>
          .
        </Text>
      </View>
    </ScrollView>
  );
}
