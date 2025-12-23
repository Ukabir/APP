import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  Text as RNText,
  TextInput,
  View,
} from "react-native";
import { Text } from "../../components/Text";
import { useUser } from "../../context/UserContext"; // Import this
import { getFingerprint } from "../../utils/device";

export default function FirstLaunchScreen() {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);
  const router = useRouter();
  const isMounted = useRef(true);
  const { setUser } = useUser(); // Get the setter from context

  const notify = (title, message) => {
    if (Platform.OS === "web") alert(`${title}\n${message}`);
    else Alert.alert(title, message);
  };

  useEffect(() => {
    isMounted.current = true;
    (async () => {
      try {
        const storedUser = await AsyncStorage.getItem("mobileUser");
        if (storedUser && isMounted.current) {
          const parsed = JSON.parse(storedUser);
          setUser(parsed); // Sync global state first
          router.replace("/profile");
          return;
        }
      } catch (e) {
        console.error("Storage error", e);
      }
      setLoading(false);
    })();
    return () => { isMounted.current = false; };
  }, []);

  async function registerForPushNotificationsAsync() {
    if (Platform.OS === "web") return null;
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== "granted") return null;
      const projectId = Constants?.expoConfig?.extra?.eas?.projectId || "yMNrI6jWuN";
      const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
      return token;
    } catch { return null; }
  }

  const handleRegister = async () => {
    if (isRegistering) return;
    if (!username.trim() || username.trim().length < 3) {
      return notify("Invalid Username", "Username must be at least 3 characters.");
    }

    setIsRegistering(true);
    try {
      const deviceId = await getFingerprint();
      const pushToken = await registerForPushNotificationsAsync();

      const res = await fetch("https://oreblogda.com/api/mobile/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            deviceId: deviceId || "device-id",
            username: username.trim(),
            pushToken,
          }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Registration failed");

      const userData = {
        deviceId,
        username: username.trim(),
        pushToken,
      };

      // 1. Save to Storage
      await AsyncStorage.setItem("mobileUser", JSON.stringify(userData));

      // 2. IMPORTANT: Update Global User Context immediately
      setUser(userData);

      // 3. Small timeout to allow Context to propagate before navigating
      setTimeout(() => {
        router.replace("/profile");
      }, 100);

    } catch (err) {
      console.error("Registration Catch:", err);
      notify("Registration Error", err.message);
      if (isMounted.current) setIsRegistering(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-white dark:bg-gray-900 justify-center items-center">
        <ActivityIndicator size="large" color="#3b82f6" />
        <RNText style={{ marginTop: 16, color: "#9ca3af", fontWeight: "bold" }}>
          Checking session...
        </RNText>
      </View>
    );
  }

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
        autoCorrect={false}
        value={username}
        onChangeText={setUsername}
        editable={!isRegistering}
      />
      <Pressable
        className={`w-full bg-blue-600 py-4 rounded-xl flex-row justify-center items-center shadow-md ${isRegistering ? "opacity-70" : "active:bg-blue-700"}`}
        onPress={handleRegister}
        disabled={isRegistering}
      >
        {isRegistering ? (
          <>
            <ActivityIndicator size="small" color="#ffffff" style={{ marginRight: 10 }} />
            <RNText style={{ color: "white", fontSize: 18, fontWeight: "600" }}>Setting up...</RNText>
          </>
        ) : (
          <RNText style={{ color: "white", fontSize: 18, fontWeight: "600" }}>Get Started</RNText>
        )}
      </Pressable>
    </View>
  );
}