import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  SafeAreaView,
  ScrollView,
  Switch,
  TouchableOpacity,
  View
} from 'react-native';
import { Text } from '../../components/Text';

export default function MoreOptions() {
  const router = useRouter();
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check current permission status on mount
  useEffect(() => {
    checkPermission();
  }, []);

  const checkPermission = async () => {
    const { status } = await Notifications.getPermissionsAsync();
    setIsNotificationsEnabled(status === 'granted');
    // Loading animation delay
    setTimeout(() => setLoading(false), 800);
  };

  const toggleNotifications = async () => {
    setLoading(true);
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    
    if (existingStatus === 'denied' && !isNotificationsEnabled) {
      // If denied, we must send them to settings
      Alert.alert(
        "Permissions Required",
        "Notifications are disabled in your system settings. Would you like to enable them now?",
        [
          { text: "Cancel", style: "cancel", onPress: () => setLoading(false) },
          { text: "Open Settings", onPress: () => {
              setLoading(false);
              Platform.OS === 'ios' ? Linking.openURL('app-settings:') : Linking.openSettings();
            } 
          }
        ]
      );
      return;
    }

    if (!isNotificationsEnabled) {
      // Try to request
      const { status } = await Notifications.requestPermissionsAsync();
      setIsNotificationsEnabled(status === 'granted');
    } else {
      // Inform user they have to disable in settings (OS restriction)
      Alert.alert(
        "Disable Notifications",
        "To fully stop notifications, please disable them in your device system settings.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Open Settings", onPress: () => Platform.OS === 'ios' ? Linking.openURL('app-settings:') : Linking.openSettings() }
        ]
      );
    }
    setLoading(false);
  };

  const MenuRow = ({ title, icon, route, color = "#3b82f6" }) => (
    <TouchableOpacity 
      onPress={() => router.push(route)}
      activeOpacity={0.7}
      className="flex-row items-center p-4 bg-white dark:bg-gray-900 mb-2 rounded-2xl border border-gray-100 dark:border-gray-800"
    >
      <View className="w-10 h-10 rounded-full items-center justify-center" style={{ backgroundColor: `${color}15` }}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text className="flex-1 ml-4 text-base font-medium dark:text-white">{title}</Text>
      <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <ScrollView className="flex-1 px-5">
        
        {/* --- Header --- */}
        <View className="flex-row items-center mt-8 mb-8">
          <TouchableOpacity 
            onPress={() => router.back()} 
            className="w-10 h-10 items-center justify-center rounded-full bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800"
          >
            <Ionicons name="arrow-back" size={22} color="#3b82f6" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold ml-4 dark:text-white">Directory</Text>
        </View>

        {/* --- Section: Settings --- */}
        <Text className="text-gray-400 font-bold uppercase text-[11px] tracking-widest mb-3 ml-1">
          App Settings
        </Text>
        <View className="flex-row items-center p-4 bg-white dark:bg-gray-900 mb-2 rounded-2xl border border-gray-100 dark:border-gray-800">
          <View className="w-10 h-10 rounded-full items-center justify-center bg-blue-50 dark:bg-blue-900/20">
            <Ionicons name="notifications" size={20} color="#3b82f6" />
          </View>
          <View className="flex-1 ml-4">
            <Text className="text-base font-medium dark:text-white">Push Notifications</Text>
            <Text className="text-xs text-gray-400">{isNotificationsEnabled ? "Enabled" : "Disabled"}</Text>
          </View>
          {loading ? (
            <ActivityIndicator size="small" color="#3b82f6" />
          ) : (
            <Switch
              trackColor={{ false: "#d1d5db", true: "#3b82f6" }}
              thumbColor={Platform.OS === 'ios' ? "#fff" : isNotificationsEnabled ? "#fff" : "#f4f3f4"}
              onValueChange={toggleNotifications}
              value={isNotificationsEnabled}
            />
          )}
        </View>

        <View className="h-4" />

        {/* --- Section 1: Help & Posting --- */}
        <Text className="text-gray-400 font-bold uppercase text-[11px] tracking-widest mb-3 ml-1">
          Writing Guidelines
        </Text>
        <MenuRow 
            title="How to Post & Formatting" 
            icon="book-outline" 
            route="/screens/Instructions" 
            color="#3b82f6" 
        />
        <MenuRow 
            title="Approval & Rejection Rules" 
            icon="shield-checkmark-outline" 
            route="/screens/Rules" 
            color="#10b981" 
        />

        <View className="h-4" />

        {/* --- Section 2: Support & Company --- */}
        <Text className="text-gray-400 font-bold uppercase text-[11px] tracking-widest mb-3 ml-1">
          Support & About
        </Text>
        <MenuRow 
            title="About the Platform" 
            icon="information-circle-outline" 
            route="/screens/About" 
            color="#8b5cf6" 
        />
        <MenuRow 
            title="Contact Support" 
            icon="mail-outline" 
            route="/screens/Contact" 
            color="#f59e0b" 
        />

        <View className="h-4" />

        {/* --- Section 3: Legal --- */}
        <Text className="text-gray-400 font-bold uppercase text-[11px] tracking-widest mb-3 ml-1">
          Legal
        </Text>
        <MenuRow 
            title="Terms of Service" 
            icon="document-text-outline" 
            route="/screens/Terms" 
            color="#64748b" 
        />
        <MenuRow 
            title="Privacy Policy" 
            icon="lock-closed-outline" 
            route="/screens/Policy" 
            color="#64748b" 
        />

        {/* --- Footer Info --- */}
        <View className="items-center mt-12 mb-10">
          <Text className="text-gray-400 text-xs">Diary Dashboard Version 1.0.5</Text>
          <Text className="text-gray-300 dark:text-gray-700 text-[10px] mt-1">Made with ❤️ for Authors</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}