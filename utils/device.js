import * as Crypto from "expo-crypto";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const STORAGE_KEY = "device_fingerprint";

export const getFingerprint = async () => {
  try {
    // Web
    if (Platform.OS === "web") {
      let id = localStorage.getItem(STORAGE_KEY);
      if (!id) {
        id = Crypto.randomUUID();
        localStorage.setItem(STORAGE_KEY, id);
      }
      return id;
    }

    // Android / iOS
    let id = await SecureStore.getItemAsync(STORAGE_KEY);
    if (!id) {
      id = Crypto.randomUUID();
      await SecureStore.setItemAsync(STORAGE_KEY, id);
    }
    return id;
  } catch {
    return Crypto.randomUUID();
  }
};
