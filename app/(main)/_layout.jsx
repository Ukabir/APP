import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useColorScheme as useNativeWind } from "nativewind";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  DeviceEventEmitter,
  Image,
  Linking,
  StatusBar,
  TouchableOpacity,
  View,
  useColorScheme as useSystemScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import "../globals.css";
import CategoryNav from "./../../components/CategoryNav";
import TopBar from "./../../components/Topbar";

export default function MainLayout() {
  const { colorScheme, setColorScheme } = useNativeWind();
  const systemScheme = useSystemScheme(); // ✅ system theme

  const [lastOffset, setLastOffset] = useState(0);
  const [isNavVisible, setIsNavVisible] = useState(true);
  const [showTop, setShowTop] = useState(false);

  const navY = useRef(new Animated.Value(0)).current;

  // ✅ FIX: Sync system theme → NativeWind
  useEffect(() => {
    if (systemScheme) {
      setColorScheme(systemScheme);
    }
  }, [systemScheme]);

  // Scroll listener
  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener("onScroll", (offsetY) => {
      setShowTop(offsetY > 400);

      if (offsetY < lastOffset || offsetY < 50) {
        if (!isNavVisible) {
          setIsNavVisible(true);
          Animated.timing(navY, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }).start();
        }
      } else if (offsetY > lastOffset && offsetY > 100) {
        if (isNavVisible) {
          setIsNavVisible(false);
          Animated.timing(navY, {
            toValue: -50,
            duration: 200,
            useNativeDriver: true,
          }).start();
        }
      }

      setLastOffset(offsetY);
    });

    return () => subscription.remove();
  }, [lastOffset, isNavVisible]);

  const isDark = colorScheme === "dark";
  const handleBackToTop = () => DeviceEventEmitter.emit("doScrollToTop");

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? "#111827" : "#ffffff" }}>
      {/* STATUS BAR */}
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      {/* HEADER */}
      {/* HEADER */}
      <SafeAreaView
        style={{
          backgroundColor: "transparent",
          zIndex: 100,
          maxHeight: 110,
          // ❌ REMOVE: maxHeight: 80 (This was strangling the CategoryNav)
          // ❌ REMOVE: overflow: 'visible'
          // ✅ ADD: Just let it flex or take natural height
        }}
      >
        <TopBar isDark={isDark} />

        <Animated.View
          style={{
            transform: [{ translateY: navY }],
            zIndex: 10,
            // Ensure the animated view doesn't have a tiny height either
          }}
        >
          <CategoryNav isDark={isDark} />
        </Animated.View>
      </SafeAreaView>


      {/* TABS */}
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: "#60a5fa",
          tabBarInactiveTintColor: isDark ? "#94a3b8" : "#64748b",
          tabBarStyle: {
            position: "absolute",
            bottom: 15,
            height: 55,
            transform: [{ translateX: '15%' }],
            width: "70%",
            alignSelf: "center",
            borderRadius: 25,
            backgroundColor: isDark ? "#1e293b" : "#ffffff",
            borderTopWidth: 0,
            paddingTop: 2,
            elevation: 5,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="authordiary"
          options={{
            title: "Authordiary",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="add-circle-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="person-outline" size={size} color={color} />
            ),
          }}
        />

        <Tabs.Screen name="post/[id]" options={{ href: null }} />
        <Tabs.Screen name="author/[id]" options={{ href: null }} />
        <Tabs.Screen name="categories/[id]" options={{ href: null }} />
      </Tabs>

      {/* FLOATING BUTTONS */}
      <View
        style={{
          position: "absolute",
          bottom: 20,
          right: 15,
          gap: 10,
          alignItems: "center",
          zIndex: 1000,
        }}
      >
        {showTop && (
          <TouchableOpacity
            onPress={handleBackToTop}
            style={{
              width: 45,
              height: 45,
              borderRadius: 23,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "#3b82f6",
              elevation: 5,
            }}
          >
            <Ionicons name="arrow-up" size={24} color="white" />
          </TouchableOpacity>
        )}

        <TouchableOpacity
          onPress={() =>
            Linking.openURL(
              "https://whatsapp.com/channel/0029VbBkiupCRs1wXFWtDG3N"
            )
          }
          style={{ elevation: 6 }}
        >
          <Image
            source={require("../../assets/images/whatsapp.png")}
            style={{ width: 50, height: 50, borderRadius: 25 }}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}
