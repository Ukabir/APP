import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView, ScrollView, TouchableOpacity, View } from 'react-native';
import { Text } from '../../components/Text';

export default function TermsAndConditions() {
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
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-950">
      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View className="flex-row items-center mt-8 mb-6">
          <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
            <Ionicons name="arrow-back" size={24} color="#3b82f6" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold ml-2 dark:text-white">Terms & Conditions</Text>
        </View>

        {/* Introduction */}
        <View className="mb-10">
          <Text className="text-gray-700 dark:text-gray-300 leading-7 text-[16px]">
            Welcome to <Text className="font-bold text-indigo-600 dark:text-indigo-400">Oreblogda</Text>! 
            By using this application, you are agreeing to the following terms. We’ve kept them simple and easy to understand.
          </Text>
        </View>

        {/* Terms Sections */}
        <Section 
          title="1. Content & Use"
          content="All posts, articles, and media on Oreblogda are for entertainment and informational purposes only. You are welcome to enjoy and share our content, but please do not copy or repost our original work without proper credit to Oreblogda."
        />

        <Section 
          title="2. User Conduct"
          content="We strive for a chill, positive community. We do not tolerate spam, hate speech, harassment, or harmful behavior. Violating these rules may lead to the removal of your comments or a permanent ban of your author account."
        />

        <Section 
          title="3. External Links"
          content="Our app may contain links to external anime sources, shops, or news sites. We do not own or control these third-party websites and are not responsible for their content or privacy practices. Browse responsibly!"
        />

        <Section 
          title="4. Modifications"
          content="Oreblogda is constantly growing. We may update these terms occasionally to reflect new features or policy changes. The latest version will always be accessible right here in the directory."
        />

        {/* Support Callout */}
        <View className="mt-4 p-8 bg-gray-50 dark:bg-gray-900 rounded-[40px] items-center border border-gray-100 dark:border-gray-800 mb-12">
          <View className="w-12 h-12 bg-white dark:bg-gray-800 rounded-full items-center justify-center mb-4 shadow-sm">
            <Ionicons name="chatbubble-ellipses-outline" size={24} color="#3b82f6" />
          </View>
          <Text className="text-gray-900 dark:text-white font-bold text-center text-lg mb-2">
            Questions?
          </Text>
          <Text className="text-gray-500 dark:text-gray-400 text-center text-sm leading-5 mb-4">
            If you have questions about these terms or our community rules, reach out to us:
          </Text>
          <Text className="font-bold text-indigo-600 dark:text-indigo-400 text-base">
            oreblogda@gmail.com
          </Text>
        </View>

        <View className="items-center mb-10">
           <Text className="text-gray-400 text-[10px] uppercase tracking-widest">© 2025 Oreblogda Media</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}