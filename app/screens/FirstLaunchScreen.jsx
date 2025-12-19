import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Platform, Pressable, TextInput, View } from "react-native";
import { Text } from "../../components/Text";
import { getFingerprint } from "../../utils/device";

export default function FirstLaunchScreen() {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);
  const router = useRouter();

  const notify = (title, message) => {
    if (Platform.OS === 'web') alert(`${title}\n${message}`);
    else Alert.alert(title, message);
  };

  useEffect(() => {
    const checkUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("mobileUser");
        if (storedUser) {
          router.replace("/");
        }
      } catch (e) {
        console.error("Storage error", e);
      } finally {
        setLoading(false);
      }
    };
    checkUser();
  }, []);

  async function registerForPushNotificationsAsync() {
    if (Platform.OS === 'web') return null;
    
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.log('Failed to get push token!');
      return null;
    }

    const token = (await Notifications.getExpoPushTokenAsync()).data;
    return token;
  }

  const handleRegister = async () => {
    if (!username.trim() || username.length < 3) {
      return notify("Invalid Username", "Username must be at least 3 characters.");
    }

    setIsRegistering(true); 
    try {
      const deviceId = await getFingerprint();
      const pushToken = await registerForPushNotificationsAsync();

      const res = await fetch("https://oreblogda.vercel.app/api/mobile/register", { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deviceId: deviceId || "device-id",
          username: username.trim(),
          pushToken: pushToken
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Registration failed");

      await AsyncStorage.setItem("mobileUser", JSON.stringify({
        deviceId,
        username: username.trim(),
        pushToken: pushToken
      }));

      router.replace("/");
    } catch (err) {
      console.error("Registration Catch:", err);
      notify("Registration Error", err.message);
    } finally {
      setIsRegistering(false); 
    }
  };

  if (loading) return (
    <View className="flex-1 bg-white dark:bg-gray-900 justify-center items-center">
      <ActivityIndicator size="large" color="#3b82f6" />
      <Text className="mt-4 text-gray-500">Checking session...</Text>
    </View>
  );

  return (
    <View className="flex-1 justify-center items-center bg-white dark:bg-gray-900 px-6">
      <Text className="text-3xl font-bold mb-4 dark:text-white">Welcome!</Text>
      <Text className="text-lg text-gray-700 dark:text-gray-300 mb-6 text-center">
        Choose a username for your posts and comments:
      </Text>

      <TextInput
        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 mb-6 text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800"
        placeholder="Username (e.g. AnimeLover)"
        placeholderTextColor="#999"
        autoCapitalize="none"
        style={{ outlineStyle: 'none' }}
        value={username}
        onChangeText={setUsername}
        editable={!isRegistering}
      />

      <Pressable
        className={`w-full bg-blue-600 py-4 rounded-xl flex-row justify-center items-center shadow-md ${isRegistering ? 'opacity-70' : 'active:bg-blue-700'}`}
        onPress={handleRegister}
        disabled={isRegistering}
      >
        {isRegistering ? (
          <>
            <ActivityIndicator size="small" color="#ffffff" className="mr-3" />
            <Text className="text-white text-lg font-semibold">Setting up...</Text>
          </>
        ) : (
          <Text className="text-white text-lg font-semibold">Get Started</Text>
        )}
      </Pressable>
    </View>
  );
}