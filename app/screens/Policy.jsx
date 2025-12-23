import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView, ScrollView, TouchableOpacity, View } from 'react-native';
import { Text } from '../../components/Text';

export default function PrivacyPolicy() {
  const router = useRouter();

  const Section = ({ title, content }) => (
    <View className="mb-8">
      <Text className="text-lg font-bold text-gray-900 dark:text-white mb-3">
        {title}
      </Text>
      <Text className="text-gray-600 dark:text-gray-400 leading-6 text-[15px]">
        {content}
      </Text>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View className="flex-row items-center mt-8 mb-6">
          <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
            <Ionicons name="arrow-back" size={24} color="#3b82f6" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold ml-2 dark:text-white">Privacy Policy</Text>
        </View>

        {/* Status Badge */}
        <View className="bg-gray-50 dark:bg-gray-900 self-start px-4 py-1.5 rounded-full mb-8 border border-gray-100 dark:border-gray-800">
          <Text className="text-gray-500 dark:text-gray-400 text-xs font-medium">
            Last Updated: October 2025
          </Text>
        </View>

        <Text className="text-gray-700 dark:text-gray-300 mb-8 leading-6 text-[16px]">
          Welcome to <Text className="font-bold text-indigo-600 dark:text-indigo-400">Oreblogda</Text>! 
          Your privacy is important to us. This policy explains how we collect, use, and protect your 
          information when you use our mobile application and services.
        </Text>

        {/* Policy Sections */}
        <Section 
          title="1. Information We Collect"
          content="We may collect personal information such as your email address when you subscribe to our newsletter or create an author profile. We also collect non-personal data automatically, like device info and general app usage through analytics tools."
        />

        <Section 
          title="2. How We Use Your Information"
          content="• To send you updates about new posts and anime news.&#10;• To improve our app experience and understand what readers enjoy.&#10;• To ensure our platform remains secure and functional."
        />

        <Section 
          title="3. Cookies & Tracking"
          content="We use local storage and cookies to personalize content and analyze traffic. You can choose to manage these in your device settings, but some parts of the app may not function properly without them."
        />

        <Section 
          title="4. Sharing of Information"
          content="We do not sell or share your personal data with third parties, except as required by law or to comply with legal processes necessary for the operation of Oreblogda."
        />

        <Section 
          title="5. Data Security"
          content="We take reasonable measures to protect your personal information. However, no method of transmission over the Internet is 100% secure, so we cannot guarantee absolute security."
        />

        <Section 
          title="6. Your Rights"
          content="You may request to update or delete your personal data by contacting us directly. If you subscribed to our newsletter, you can unsubscribe anytime via the link in our emails."
        />

        <Section 
          title="7. Policy Updates"
          content="We may update this Privacy Policy occasionally to reflect changes in our practices. The date at the top will always show the latest version."
        />

        {/* Contact Footer */}
        <View className="mt-4 p-6 bg-blue-50 dark:bg-blue-900/10 rounded-3xl border border-blue-100 dark:border-blue-900/20 mb-12">
          <Text className="text-blue-800 dark:text-blue-300 font-bold mb-2 text-center">Questions?</Text>
          <Text className="text-blue-700 dark:text-blue-400 text-center text-sm leading-5">
            If you have any questions about this Privacy Policy, please contact us at:{"\n"}
            <Text className="font-bold">oreblogda@gmail.com</Text>
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}