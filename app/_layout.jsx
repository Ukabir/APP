import { useFonts } from "expo-font";
import * as Notifications from "expo-notifications"; // 👈 Added Notifications
import { Stack, useRouter } from "expo-router"; // 👈 Added useRouter
import * as SplashScreen from "expo-splash-screen";
import { useColorScheme } from "nativewind";
import { useEffect } from "react";
import { ActivityIndicator, StatusBar, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast from 'react-native-toast-message';
import { UserProvider } from "../context/UserContext";
import "./globals.css";

SplashScreen.preventAutoHideAsync();
// This tells the OS to show the banner even if the app is foregrounded
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function RootLayout() {
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === "dark";
    const router = useRouter(); // 👈 Initialize router

    const [loaded, error] = useFonts({
        "SpaceGrotesk": require("../assets/fonts/SpaceGrotesk.ttf"),
        "SpaceGroteskBold": require("../assets/fonts/SpaceGrotesk.ttf"), 
    });

    // Handle Fonts and Splash Screen
    useEffect(() => {
        if (loaded || error) {
            const timer = setTimeout(() => {
                SplashScreen.hideAsync();
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [loaded, error]);

    // Handle Notification Clicks
    useEffect(() => {
        // This listener fires when a user taps on a notification
        const subscription = Notifications.addNotificationResponseReceivedListener(response => {
            const data = response.notification.request.content.data;

            // Log data for debugging (you can remove this later)
            // console.log("🔔 Notification Tapped with data:", data);

            if (data?.postId) {
                // Navigate to the dynamic post route
                router.push({
                    pathname: "/post/[id]", 
                    params: { id: data.postId }
                });
            }
        });

        return () => subscription.remove();
    }, []);

    useEffect(() => {
        // 1. THIS HANDLES THE CLICK (Background/Killed state)
        const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
            const data = response.notification.request.content.data;
            if (data?.postId) {
                router.push({ pathname: "/post/[id]", params: { id: data.postId } });
            }
        });

        // 2. THIS HANDLES ARRIVAL (Foreground state)
        const notificationSubscription = Notifications.addNotificationReceivedListener(notification => {
            // Optional: You can trigger a custom in-app toast here
            console.log("🔥 Notification arrived while app was open:", notification);
        });

        return () => {
            responseSubscription.remove();
            notificationSubscription.remove();
        };
    }, []);

    // --- Loading Animation Pattern ---
    if (!loaded && !error) {
        return (
            <View className="flex-1 bg-white dark:bg-[#0a0a0a] justify-center items-center">
                <ActivityIndicator size="large" color="#3b82f6" />
            </View>
        );
    }

    return (
        <UserProvider>
            <SafeAreaProvider>
                <View 
                    key={colorScheme} 
                    className="flex-1 bg-white dark:bg-[#0a0a0a]"
                >
                    <StatusBar
                        barStyle={isDark ? "light-content" : "dark-content"}
                        backgroundColor={isDark ? "#0a0a0a" : "#ffffff"}
                    />

                    <Stack
                        screenOptions={{
                            headerShown: false,
                            contentStyle: { backgroundColor: isDark ? "#0a0a0a" : "#ffffff" },
                        }}
                    >
                    </Stack>
                    <Toast />
                </View>
            </SafeAreaProvider>
        </UserProvider>
    );
}