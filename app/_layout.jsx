import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useColorScheme } from "nativewind";
import { useEffect } from "react"; // Added useState
import { ActivityIndicator, StatusBar, View } from "react-native"; // Added ActivityIndicator
import { SafeAreaProvider } from "react-native-safe-area-context";
import { UserProvider } from "../context/UserContext";
import "./globals.css";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === "dark";

    const [loaded, error] = useFonts({
        "SpaceGrotesk": require("../assets/fonts/SpaceGrotesk.ttf"),
        "SpaceGroteskBold": require("../assets/fonts/SpaceGrotesk.ttf"), 
    });

    useEffect(() => {
        if (loaded || error) {
            // Give it a tiny delay so the transition feels smooth
            const timer = setTimeout(() => {
                SplashScreen.hideAsync();
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [loaded, error]);

    // --- Loading Animation Pattern ---
    // If fonts aren't ready, we stay on the Splash Screen. 
    // If you ever add more loading logic here (like checking a database), 
    // this is where the spinner would live.
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
                    />
                </View>
            </SafeAreaProvider>
        </UserProvider>
    );
}