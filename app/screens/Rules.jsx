import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView, ScrollView, TouchableOpacity, View } from 'react-native';
import { Text } from '../../components/Text';

export default function Rules() {
  const router = useRouter();

  const RuleItem = ({ icon, title, desc, type }) => (
    <View className={`p-5 rounded-3xl mb-4 border ${
      type === 'success' 
      ? 'bg-green-50 dark:bg-green-900/10 border-green-100 dark:border-green-900/20' 
      : 'bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-900/20'
    }`}>
      <View className="flex-row items-center mb-2">
        <Ionicons 
          name={icon} 
          size={20} 
          color={type === 'success' ? '#22c55e' : '#ef4444'} 
        />
        <Text className={`ml-2 font-bold ${type === 'success' ? 'text-green-800 dark:text-green-400' : 'text-red-800 dark:text-red-400'}`}>
          {title}
        </Text>
      </View>
      <Text className="text-gray-600 dark:text-gray-400 text-sm leading-5">{desc}</Text>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-950">
      <ScrollView className="flex-1 px-5" contentContainerStyle={{ paddingBottom: 50 }}>
        
        {/* Header */}
        <View className="flex-row items-center mt-8 mb-8">
          <TouchableOpacity onPress={() => router.back()} className="p-2">
            <Ionicons name="arrow-back" size={24} color="#3b82f6" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold ml-2 dark:text-white">Rules & Approval</Text>
        </View>

        <Text className="text-gray-600 dark:text-gray-400 mb-6 px-1">
          Our team reviews every post. Follow these guidelines to ensure your diary entry goes live as quickly as possible.
        </Text>

        {/* --- ✅ BOOST APPROVAL --- */}
        <Text className="text-gray-400 font-bold uppercase text-[11px] tracking-widest mb-4 ml-1">How to get Approved Fast</Text>
        
        <RuleItem 
          type="success"
          icon="color-wand-outline"
          title="Rich Formatting"
          desc="Posts that use [section], [h], and [li] tags effectively are much more likely to be approved. We value readability!"
        />

        <RuleItem 
          type="success"
          icon="language-outline"
          title="Language: English"
          desc="While we accept multiple languages, posts written in English are currently processed much faster by our moderation team."
        />

        <RuleItem 
          type="success"
          icon="pricetag-outline"
          title="Accurate Categorization"
          desc="Ensure your post matches its category (e.g., don't post News under Memes). Accuracy helps users find your content."
        />

        <View className="h-6" />

        {/* --- ❌ REJECTION TRIGGERS --- */}
        <Text className="text-gray-400 font-bold uppercase text-[11px] tracking-widest mb-4 ml-1">Common Rejection Reasons</Text>

        <RuleItem 
          type="error"
          icon="alert-circle-outline"
          title="Adult & Sexual Content"
          desc="Strictly prohibited. Any post containing NSFW text, images, or links will be rejection."
        />

        <RuleItem 
          type="error"
          icon="trash-outline"
          title="Low Effort / Spam"
          desc="Posts with just 'Hi', 'Test', or repetitive gibberish are considered spam. Your entry should provide value to the readers."
        />

        <RuleItem 
          type="error"
          icon="warning-outline"
          title="Hate Speech & Bullying"
          desc="We maintain a positive environment. Content that attacks individuals or groups based on race, religion, or identity is deleted immediately."
        />

        <RuleItem 
          type="error"
          icon="link-outline"
          title="Broken or Shortened Links"
          desc="Shortened URLs (like bit.ly) are often flagged as unsafe. Use direct TikTok or YouTube links for media."
        />

        {/* Final Note */}
        <View className="mt-8 p-6 bg-gray-50 dark:bg-gray-900 rounded-3xl items-center">
          <Ionicons name="time-outline" size={24} color="#9ca3af" />
          <Text className="text-center text-gray-500 text-xs mt-3 leading-5">
            Most posts are reviewed within 1-6 hours. If your post is rejected, you can submit a new one after 24 hours.
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}