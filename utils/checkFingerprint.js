import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const STORAGE_KEY = "device_fingerprint";

export const hasFingerprint = async () => {
  try {
    if (Platform.OS === "web") {
      return !!localStorage.getItem(STORAGE_KEY);
    }

    const value = await SecureStore.getItemAsync(STORAGE_KEY);
    return !!value;
  } catch {
    return false;
  }
};
