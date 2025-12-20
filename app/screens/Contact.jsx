import { Ionicons } from '@expo/vector-icons';
import { Picker } from "@react-native-picker/picker";
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, TextInput, TouchableOpacity, View } from 'react-native';
import { Text } from '../../components/Text';

export default function Contact() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", message: "", type: "General" });
  const [status, setStatus] = useState({ loading: false, success: "", error: "" });

  const handleChange = (key, value) => {
    setForm({ ...form, [key]: value });
  };

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.message) {
      setStatus({ ...status, error: "Please fill in all fields." });
      return;
    }

    setStatus({ loading: true, success: "", error: "" });

    try {
      const res = await fetch("https://oreblogda.vercel.app/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus({ loading: false, success: "Message sent! We'll get back to you soon.", error: "" });
        setForm({ name: "", email: "", message: "", type: "General" });
      } else {
        setStatus({ loading: false, success: "", error: data.error || "Something went wrong." });
      }
    } catch {
      setStatus({ loading: false, success: "", error: "Network error, check your connection." });
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-950">
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"} 
        className="flex-1"
      >
        <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
          
          {/* Header */}
          <View className="flex-row items-center mt-8 mb-6">
            <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
              <Ionicons name="arrow-back" size={24} color="#3b82f6" />
            </TouchableOpacity>
            <Text className="text-2xl font-bold ml-2 dark:text-white">Contact Us</Text>
          </View>

          <Text className="text-gray-600 dark:text-gray-400 mb-8 leading-6">
            Have a bug to report or a suggestion for the community? Drop us a message and our team will get back to you.
          </Text>

          {/* Form Fields */}
          <View className="space-y-5">
            
            {/* Name Input */}
            <View>
              <Text className="text-gray-500 font-bold uppercase text-[11px] tracking-widest mb-2 ml-1">Your Name</Text>
              <TextInput
                value={form.name}
                onChangeText={(v) => handleChange("name", v)}
                placeholder="Enter your name"
                placeholderTextColor="#9ca3af"
                className="bg-gray-50 dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 text-gray-900 dark:text-white"
              />
            </View>

            {/* Email Input */}
            <View className="mt-4">
              <Text className="text-gray-500 font-bold uppercase text-[11px] tracking-widest mb-2 ml-1">Email Address</Text>
              <TextInput
                value={form.email}
                onChangeText={(v) => handleChange("email", v)}
                placeholder="you@example.com"
                placeholderTextColor="#9ca3af"
                keyboardType="email-address"
                autoCapitalize="none"
                className="bg-gray-50 dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 text-gray-900 dark:text-white"
              />
            </View>

            {/* Category Picker */}
            <View className="mt-4">
              <Text className="text-gray-500 font-bold uppercase text-[11px] tracking-widest mb-2 ml-1">Topic</Text>
              <View className="bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                <Picker
                  selectedValue={form.type}
                  onValueChange={(v) => handleChange("type", v)}
                  dropdownIconColor="#3b82f6"
                  style={{ color: Platform.OS === 'ios' ? undefined : '#9ca3af' }}
                >
                  <Picker.Item label="General Inquiry" value="General" />
                  <Picker.Item label="Community Join Request" value="Community" />
                  <Picker.Item label="Bug Report" value="Bug" />
                  <Picker.Item label="Suggestion" value="Suggestion" />
                </Picker>
              </View>
            </View>

            {/* Message Input */}
            <View className="mt-4">
              <Text className="text-gray-500 font-bold uppercase text-[11px] tracking-widest mb-2 ml-1">Your Message</Text>
              <TextInput
                value={form.message}
                onChangeText={(v) => handleChange("message", v)}
                placeholder="Tell us what's on your mind..."
                placeholderTextColor="#9ca3af"
                multiline
                numberOfLines={6}
                textAlignVertical="top"
                className="bg-gray-50 dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 text-gray-900 dark:text-white min-h-[120px]"
              />
            </View>

            {/* Feedback Messages */}
            {status.success ? (
              <View className="bg-green-50 dark:bg-green-900/10 p-4 rounded-2xl border border-green-100 dark:border-green-900/20 mt-2">
                <Text className="text-green-600 text-center font-medium">{status.success}</Text>
              </View>
            ) : null}

            {status.error ? (
              <View className="bg-red-50 dark:bg-red-900/10 p-4 rounded-2xl border border-red-100 dark:border-red-900/20 mt-2">
                <Text className="text-red-600 text-center font-medium">{status.error}</Text>
              </View>
            ) : null}

            {/* Submit Button */}
            <TouchableOpacity
              disabled={status.loading}
              onPress={handleSubmit}
              activeOpacity={0.8}
              className={`mt-6 py-4 rounded-2xl flex-row justify-center items-center shadow-sm ${status.loading ? 'bg-blue-400' : 'bg-blue-600'}`}
            >
              {status.loading ? (
                <ActivityIndicator color="white" size="small" className="mr-2" />
              ) : (
                <Ionicons name="send" size={18} color="white" style={{ marginRight: 8 }} />
              )}
              <Text className="text-white font-bold text-lg">
                {status.loading ? "Sending..." : "Send Message"}
              </Text>
            </TouchableOpacity>

          </View>

          <View className="h-20" />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}