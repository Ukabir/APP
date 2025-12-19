import * as Application from 'expo-application';
import { Platform } from 'react-native';

export const getFingerprint = async () => {
  // if (Platform.OS === "web") {
  //   const storage = globalThis?.localStorage;
  //   if (!storage) return "web-unknown";

  //   let webId = storage.getItem("web_fingerprint");
  //   if (!webId) {
  //     webId = "web-" + Math.random().toString(36).substring(2, 15);
  //     storage.setItem("web_fingerprint", webId);
  //   }
  //   return webId;
  // }

  if (Platform.OS === "android") {
    return Application.androidId;
  }

  if (Platform.OS === "ios") {
    return await Application.getIosIdForVendorAsync();
  }

  return "unknown-device";
};
