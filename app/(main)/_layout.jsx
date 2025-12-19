import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useColorScheme as useNativeWind } from "nativewind";
import { useEffect, useRef, useState } from "react";
import { Animated, DeviceEventEmitter, Image, Linking, TouchableOpacity, useColorScheme as useSystemScheme, View } from "react-native";
import "../globals.css";
import CategoryNav from "./../../components/CategoryNav";
import TopBar from "./../../components/Topbar";

export default function MainLayout() {
    const { colorScheme, setColorScheme } = useNativeWind();
    const systemScheme = useSystemScheme();
    const [showTop, setShowTop] = useState(false);

    // --- ANIMATION LOGIC FOR CATEGORY NAV ---
    const scrollAnim = useRef(new Animated.Value(0)).current
    const [lastOffset, setLastOffset] = useState(0)
    const [isNavVisible, setIsNavVisible] = useState(true)

    // We use a translateY animation to slide the bar in and out
    const navY = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (systemScheme) {
            setColorScheme(systemScheme);
        }

        const subscription = DeviceEventEmitter.addListener("onScroll", (offsetY) => {
            // 1. Back to Top Button Logic
            setShowTop(offsetY > 400);

            // 2. Quick-Return CategoryNav Logic
            // If scrolling up (offset decreasing) or at the very top, show it
            if (offsetY < lastOffset || offsetY < 50) {
                if (!isNavVisible) {
                    setIsNavVisible(true);
                    Animated.timing(navY, { toValue: 0, duration: 200, useNativeDriver: true }).start();
                }
            }
            // If scrolling down (offset increasing) and past a threshold, hide it
            else if (offsetY > lastOffset && offsetY > 100) {
                if (isNavVisible) {
                    setIsNavVisible(false);
                    Animated.timing(navY, { toValue: -60, duration: 200, useNativeDriver: true }).start();
                }
            }
            setLastOffset(offsetY);
        });

        return () => subscription.remove();
    }, [systemScheme, lastOffset, isNavVisible]);

    const isDark = colorScheme === "dark";
    const openWhatsapp = () => Linking.openURL("https://whatsapp.com/channel/0029VbBkiupCRs1wXFWtDG3N");

    const handleBackToTop = () => {
        DeviceEventEmitter.emit("doScrollToTop");
    };

    return (
        // Change the style here to use a conditional background color
        <View
            style={{ flex: 1, backgroundColor: isDark ? "#111827" : "#ffffff" }}
            className="bg-white dark:bg-gray-900"
        >


            {/* 1. ANIMATED CATEGORY NAV (Placed first so it's lower in stack) */}
            <Animated.View
                style={{
                    transform: [{ translateY: navY }],
                    position: 'absolute',
                    top: 60, // Starts at the bottom edge of the TopBar
                    left: 0,
                    right: 0,
                    zIndex: 10, // Lower Z-index
                }}
            >
                <CategoryNav isDark={isDark} />
            </Animated.View>
            {/* 2. FIXED TOPBAR (Placed second + Higher Z-index) */}
            <View style={{ zIndex: 20, backgroundColor: isDark ? "#111827" : "#ffffff" }}>
                <TopBar isDark={isDark} />
            </View>
            <Tabs
                screenOptions={{
                    headerShown: false,
                    tabBarActiveTintColor: "#60a5fa",
                    tabBarInactiveTintColor: isDark ? "#94a3b8" : "#64748b",
                    tabBarStyle: {
                        position: 'absolute',
                        bottom: 15,
                        height: 55,
                        width: '70%',
                        alignSelf: "center",
                        marginLeft: "-7px",
                        left: '15%',
                        borderRadius: 25,
                        backgroundColor: isDark ? "#1e293b" : "#ffffff",
                        borderTopWidth: 0,
                        elevation: 5,
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 10 },
                        shadowOpacity: 0.1,
                        shadowRadius: 10,
                    },
                }}
            >
                <Tabs.Screen name="index" options={{ title: "Home", tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} /> }} />
                <Tabs.Screen name="authordiary" options={{ title: "Authordiary", tabBarIcon: ({ color, size }) => <Ionicons name="add-circle-outline" size={size} color={color} /> }} />
                <Tabs.Screen name="profile" options={{ title: "Profile", tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" size={size} color={color} /> }} />

                {/* Hidden Screens */}
                <Tabs.Screen name="privacy" options={{ href: null }} />
                <Tabs.Screen name="terms" options={{ href: null }} />
                <Tabs.Screen name="post/[id]" options={{ href: null }} />
                <Tabs.Screen name="author/[id]" options={{ href: null }} />
                <Tabs.Screen name="categories/[id]" options={{ href: null }} />
                {/* <Tabs.Screen name="settings" options={{ href: null }} /> */}
                <Tabs.Screen name="contact" options={{ href: null }} />
                <Tabs.Screen name="about" options={{ href: null }} />
            </Tabs>

            {/* FLOATING ACTION BUTTONS GROUP */}
            <View style={{ position: 'absolute', bottom: 20, right: 10, gap: 10, alignItems: 'center' }}>
                {showTop && (
                    <TouchableOpacity
                        onPress={handleBackToTop}
                        className="bg-blue-500 shadow-lg"
                        style={{ width: 45, height: 45, borderRadius: 25, justifyContent: 'center', alignItems: 'center' }}
                    >
                        <Ionicons name="arrow-up" size={24} color="white" />
                    </TouchableOpacity>
                )}
                <TouchableOpacity onPress={openWhatsapp} style={{ elevation: 5 }}>
                    <Image
                        source={require("../../assets/images/whatsapp.png")}
                        style={{ width: 50, height: 50, borderRadius: 25 }}
                    />
                </TouchableOpacity>
            </View>
        </View>
    );
}