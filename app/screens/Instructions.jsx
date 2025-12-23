import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView, ScrollView, TouchableOpacity, View } from 'react-native';
import { Text } from '../../components/Text';

export default function Instructions() {
  const router = useRouter();

  const InstructionStep = ({ icon, title, desc, color }) => (
    <View className="flex-row items-start mb-6">
      <View className="w-10 h-10 rounded-full items-center justify-center" style={{ backgroundColor: `${color}15` }}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <View className="flex-1 ml-4">
        <Text className="text-lg font-bold dark:text-white">{title}</Text>
        <Text className="text-gray-600 dark:text-gray-400 mt-1 leading-5">{desc}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      <ScrollView className="flex-1 px-5" contentContainerStyle={{ paddingBottom: 50 }}>
        
        {/* Header */}
        <View className="flex-row items-center mt-8 mb-8">
          <TouchableOpacity onPress={() => router.back()} className="p-2">
            <Ionicons name="arrow-back" size={24} color="#3b82f6" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold ml-2 dark:text-white">How to Post</Text>
        </View>

        {/* 1. The Core Workflow */}
        <Text className="text-gray-400 font-bold uppercase text-[11px] tracking-widest mb-6 ml-1">The Basics</Text>
        
        <InstructionStep 
          icon="text-outline"
          title="Drafting your Message"
          desc="Start with a catchy title. Use the formatting buttons to add headers [h] or block sections [section] to make your post readable."
          color="#3b82f6"
        />

        <InstructionStep 
          icon="eye-outline"
          title="Always Use Preview"
          desc="Before submitting, tap the 'Show Preview' button. This is crucial! It shows you exactly how your post looks. If tags are broken, fix them before hitting submit."
          color="#8b5cf6"
        />

        {/* 2. Media & TikTok */}
        <View className="h-[1px] bg-gray-100 dark:bg-gray-800 my-4" />
        <Text className="text-gray-400 font-bold uppercase text-[11px] tracking-widest mb-6 ml-1">Media & TikTok</Text>
        
        <View className="bg-blue-50 dark:bg-blue-900/10 p-5 rounded-3xl border border-blue-100 dark:border-blue-800/30 mb-6">
          <View className="flex-row items-center mb-2">
            <Ionicons name="logo-tiktok" size={20} color="#3b82f6" />
            <Text className="ml-2 font-bold text-blue-800 dark:text-blue-300">TikTok Embeds</Text>
          </View>
          <Text className="text-blue-700 dark:text-blue-400 text-sm leading-5">
            To embed a TikTok, copy the link directly from the app. Ensure it is a full link (e.g., https://www.tiktok.com/@user/video/...). Shortened links (vm.tiktok.com) might take longer to load for users.
          </Text>
        </View>

        {/* 3. Polls & Categories */}
        <Text className="text-gray-400 font-bold uppercase text-[11px] tracking-widest mb-6 ml-1">Engagement</Text>
        
        <InstructionStep 
          icon="stats-chart-outline"
          title="Interactive Polls"
          desc="Want opinions? Turn on the 'Add a Poll' switch. You need at least 2 options. Posts with polls often get 3x more engagement!"
          color="#10b981"
        />

        <InstructionStep 
          icon="list-outline"
          title="Choose the Right Category"
          desc="Selecting 'Memes' for a news story will lead to rejection. Be accurate so users can find your content easily."
          color="#f59e0b"
        />

        {/* 4. Formatting Guide Table */}
        <View className="bg-gray-50 dark:bg-gray-900 p-5 rounded-3xl mt-4 border border-gray-100 dark:border-gray-800">
          <Text className="font-bold dark:text-white mb-4">Quick Tag Reference</Text>
          
          <View className="flex-row justify-between mb-3 border-b border-gray-200 dark:border-gray-800 pb-2">
            <Text className="text-blue-600 font-mono text-xs">[h]Text[/h]</Text>
            <Text className="text-gray-500 text-xs">Bold Heading</Text>
          </View>

          <View className="flex-row justify-between mb-3 border-b border-gray-200 dark:border-gray-800 pb-2">
            <Text className="text-blue-600 font-mono text-xs">[section]Text[/section]</Text>
            <Text className="text-gray-500 text-xs">Wrapped Box</Text>
          </View>

          <View className="flex-row justify-between mb-3 border-b border-gray-200 dark:border-gray-800 pb-2">
            <Text className="text-blue-600 font-mono text-xs">[li]Text[/li]</Text>
            <Text className="text-gray-500 text-xs">List Bullet Point</Text>
          </View>

          <View className="flex-row justify-between">
            <Text className="text-blue-600 font-mono text-xs">[br]</Text>
            <Text className="text-gray-500 text-xs">Line Break (Space)</Text>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}