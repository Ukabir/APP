import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView, ScrollView, TouchableOpacity, View } from 'react-native';
import { Text } from '../../components/Text';

export default function AboutScreen() {
  const router = useRouter();

  const MissionCard = ({ icon, title, text }) => (
    <View className="bg-gray-50 dark:bg-gray-900 p-5 rounded-3xl mb-4 border border-gray-100 dark:border-gray-800">
      <View className="flex-row items-center mb-2">
        <Ionicons name={icon} size={20} color="#3b82f6" />
        <Text className="ml-2 font-bold dark:text-white">{title}</Text>
      </View>
      <Text className="text-gray-600 dark:text-gray-400 text-sm leading-5">
        {text}
      </Text>
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
          <Text className="text-2xl font-bold ml-2 dark:text-white">About Us</Text>
        </View>

        {/* Hero Section */}
        <View className="items-center mb-10">
          <View className="w-20 h-20 bg-pink-100 dark:bg-pink-900/30 rounded-full items-center justify-center mb-4">
             <Text className="text-4xl">🎌</Text>
          </View>
          <Text className="text-3xl font-bold text-gray-900 dark:text-white text-center">
            Oreblogda
          </Text>
          <Text className="text-blue-600 dark:text-blue-400 font-medium text-center mt-1">
            Your Chill Anime Corner
          </Text>
        </View>

        {/* Introduction */}
        <View className="mb-8">
          <Text className="text-lg text-gray-700 dark:text-gray-300 text-center leading-7 px-2">
            Welcome to <Text className="font-bold text-indigo-600 dark:text-indigo-400">Oreblogda</Text> — 
            your hub for everything anime, manga, and otaku culture!
          </Text>
        </View>

        <Text className="text-gray-400 font-bold uppercase text-[11px] tracking-widest mb-4 ml-1">What we do</Text>

        {/* Content Breakdown */}
        <MissionCard 
          icon="flash-outline"
          title="Stay Updated"
          text="From the latest news and episode breakdowns to fun facts and underrated recommendations, we keep you updated on what’s hot."
        />

        <MissionCard 
          icon="heart-outline"
          title="Community First"
          text="Whether you’re deep into shōnen battles, slice-of-life stories, or here for the memes — we’ve got you covered."
        />

        <MissionCard 
          icon="shield-checkmark-outline"
          title="Our Mission"
          text="We’re fans first — writers second. Our goal is to make anime news fun, honest, and worth your time."
        />

        {/* Fun Footer Sign-off */}
        <View className="mt-10 p-8 rounded-[40px] bg-indigo-50 dark:bg-indigo-900/10 items-center">
          <Text className="text-4xl mb-4">🍿</Text>
          <Text className="text-indigo-900 dark:text-indigo-300 text-center font-bold text-lg mb-2">
            Grab your snacks!
          </Text>
          <Text className="text-indigo-700/70 dark:text-indigo-400/70 text-center leading-5 text-sm">
            Power up your Wi-Fi and join the community. Stay tuned, stay hyped, and never skip the opening song!
          </Text>
        </View>

        <View className="items-center mt-12 mb-10">
           <Text className="text-gray-400 text-xs">Built by Fans for Fans</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}