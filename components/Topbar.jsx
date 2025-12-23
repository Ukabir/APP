import { Ionicons } from "@expo/vector-icons";
import { useRouter } from 'expo-router';
import { Image, SafeAreaView, TouchableOpacity, View } from "react-native";


const TopBar = ({ isDark }) => {
  // Use the same logic as your web component for logo switching
  const logoSrc = isDark
    ? require("../assets/images/christmasiconwhite.png")
    : require("../assets/images/christmasiconblue.png");

    const router = useRouter();
  return (
    /* SafeAreaView ensures the content starts below the iPhone notch/Android status bar */
    <SafeAreaView className={isDark ? "bg-gray-900" : "bg-white"}>
      <View
        className={`flex-row items-center justify-between px-3 h-16 shadow-md ${isDark ? "bg-gray-900 border-b border-gray-800" : "bg-white border-b border-gray-100"
          }`}
        style={{
          // elevation adds shadow on Android, shadowProps for iOS
          elevation: 4,
          zIndex: 1000,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 3,
        }}
      >
        {/* Logo Section */}
        <View className="shrink-0">
          <Image
            source={logoSrc}
            alt="Oreblogda Logo"
            style={{ width: 180, height: 45, resizeMode: 'contain' }}
          />
        </View>

        {/* Right Side Icons (Optional: e.g., Search or Profile) */}
        <View className="flex-row items-center gap-4">
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push("/screens/MoreOptions")}
            className="p-2"
          >
            <Ionicons
              name="menu-outline"
              size={28}
              color={isDark ? "#ffffff" : "#111827"}
            />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default TopBar;