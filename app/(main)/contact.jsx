import { Picker } from "@react-native-picker/picker";
import { useState } from "react";
import {
  Animated,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Text } from "./../../components/Text";

export default function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
    type: "General",
  });

  const [status, setStatus] = useState({
    loading: false,
    success: "",
    error: "",
  });

  const handleChange = (key, value) => {
    setForm({ ...form, [key]: value });
  };

  const handleSubmit = async () => {
    setStatus({ loading: true, success: "", error: "" });

    try {
      const res = await fetch(
        "https://oreblogda.vercel.app/api/contact", // ⚠️ use absolute URL
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );

      const data = await res.json();

      if (res.ok) {
        setStatus({
          loading: false,
          success: "Message sent successfully!",
          error: "",
        });
        setForm({ name: "", email: "", message: "", type: "General" });
      } else {
        setStatus({
          loading: false,
          success: "",
          error: data.error || "Something went wrong.",
        });
      }
    } catch {
      setStatus({
        loading: false,
        success: "",
        error: "Network error, try again.",
      });
    }
  };

  return (
    <ScrollView
      className="flex-1 bg-gradient-to-br from-blue-50 via-white to-pink-50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950"
      contentContainerStyle={{ paddingVertical: 64, paddingHorizontal: 24 }}
    >
      {/* Background glow */}
      <View className="absolute top-10 left-10 w-48 h-48 bg-blue-300 dark:bg-indigo-700 opacity-20 rounded-full blur-3xl" />
      <View className="absolute bottom-10 right-10 w-56 h-56 bg-pink-300 dark:bg-pink-700 opacity-20 rounded-full blur-3xl" />

      <Animated.View
        className="bg-white/80 dark:bg-gray-900/60 backdrop-blur-md p-6 rounded-2xl shadow-xl"
      >
        <Text className="text-2xl font-bold mb-4 text-center text-gray-900 dark:text-gray-100">
          Contact Oreblogda
        </Text>

        <Text className="text-center text-gray-600 dark:text-gray-400 mb-6">
          Have suggestions, found a bug, or want to join our anime community?
          Drop a message below — we’d love to hear from you!
        </Text>

        {/* Name */}
        <Text className="text-sm mb-1 dark:text-gray-300">Your Name</Text>
        <TextInput
          value={form.name}
          onChangeText={(v) => handleChange("name", v)}
            style={{ outlineStyle: 'none' }}
          className="border rounded-md px-4 py-3 mb-4 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
        />

        {/* Email */}
        <Text className="text-sm mb-1 dark:text-gray-300">Email Address</Text>
        <TextInput
          value={form.email}
            style={{ outlineStyle: 'none' }}
          onChangeText={(v) => handleChange("email", v)}
          keyboardType="email-address"
          className="border rounded-md px-4 py-3 mb-4 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
        />

        {/* Category */}
        <Text className="text-sm mb-1 dark:text-gray-300">Category</Text>
        <View className="border rounded-md mb-4 dark:border-gray-700 dark:bg-gray-800">
          <Picker
            selectedValue={form.type}
            onValueChange={(v) => handleChange("type", v)}
          >
            <Picker.Item label="General" value="General" />
            <Picker.Item label="Community Join Request" value="Community Join Request" />
            <Picker.Item label="Bug Report" value="Bug Report" />
            <Picker.Item label="Suggestion" value="Suggestion" />
            <Picker.Item label="Collaboration" value="Collaboration" />
          </Picker>
        </View>

        {/* Message */}
        <Text className="text-sm mb-1 dark:text-gray-300">Message</Text>
        <TextInput
          value={form.message}
            style={{ outlineStyle: 'none' }}
          onChangeText={(v) => handleChange("message", v)}
          multiline
          numberOfLines={5}
          className="border rounded-md px-4 py-3 mb-6 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          textAlignVertical="top"
        />

        {/* Submit */}
        <TouchableOpacity
          disabled={status.loading}
          onPress={handleSubmit}
          className="bg-blue-600 py-3 rounded-md"
        >
          <Text className="text-white text-center font-semibold">
            {status.loading ? "Sending..." : "Send Message"}
          </Text>
        </TouchableOpacity>

        {status.success ? (
          <Text className="text-green-500 text-center mt-3">
            {status.success}
          </Text>
        ) : null}

        {status.error ? (
          <Text className="text-red-500 text-center mt-3">
            {status.error}
          </Text>
        ) : null}
      </Animated.View>
    </ScrollView>
  );
}
