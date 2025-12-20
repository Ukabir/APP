import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator, Alert,
  Platform,
  ScrollView,
  Switch, TextInput, TouchableOpacity,
  View
} from "react-native";
import { useUser } from "../../context/UserContext";
import { Text } from "./../../components/Text";

const API_BASE = "https://oreblogda.vercel.app/api";

export default function AuthorDiaryDashboard() {
  const { user, loading: contextLoading, setUser } = useUser();
  const fingerprint = user?.deviceId
  const router = useRouter()
  
  // Form States
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState("News");
  const [mediaUrl, setMediaUrl] = useState("");
  const [mediaUrlLink, setMediaUrlLink] = useState("");
  const [mediaType, setMediaType] = useState("image");

  // Poll States
  const [hasPoll, setHasPoll] = useState(false);
  const [pollMultiple, setPollMultiple] = useState(false);
  const [pollOptions, setPollOptions] = useState(["", ""]);

  // System States
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [todayPost, setTodayPost] = useState(null);

  // --- Check if user already posted today ---
  // 🔹 1. Sync User Data from DB using deviceId (Fingerprint)
  useEffect(() => {
    const syncUserWithDB = async () => {
      if (!user?.deviceId) return;
      try {
        // Fetch full user data (gets us the real MongoDB _id)
        const res = await fetch(`${API_BASE}/users/me?fingerprint=${user.deviceId}`);
        const dbUser = await res.json();

        if (res.ok) {
          setUser(dbUser);
        }
      } catch (err) {
        console.error("Sync User Error:", err);
      }
    };
    syncUserWithDB();
  }, [user?.deviceId]);
  const checkDailyStatus = useCallback(async () => {
    // 1. Wait until the syncUserWithDB has finished and we have a real MongoDB _id
    if (!user?._id) {
      // If context is done loading but we STILL don't have an _id, 
      // it means the sync failed or hasn't started.
      if (!contextLoading) {
        // We can't check status without an ID, so show the form as fallback
        setCheckingStatus(false);
      }
      return;
    }

    try {
      // 2. Use the synced _id to check for posts
      const res = await fetch(`${API_BASE}/posts?author=${user._id}&limit=1`);
      const data = await res.json();

      if (data.posts && data.posts.length > 0) {
        const lastPost = data.posts[0];
        const postDate = new Date(lastPost.createdAt);

        const now = new Date();

        // Check if it was within the last 24 hours
        if (now.getTime() - postDate.getTime() < 24 * 60 * 60 * 1000) {
          setTodayPost(lastPost);
        }
      }
    } catch (err) {
      console.error("Status Check Error:", err);
    } finally {
      setCheckingStatus(false);
    }
  }, [user?._id, contextLoading]); // 👈 Watch for the synced _id

  useEffect(() => {
    if (!contextLoading) {
      if (!user) {
        router.replace("/screens/FirstLaunchScreen");
      } else {
        checkDailyStatus();
      }
    }
  }, [user, contextLoading, checkDailyStatus]);

  // --- Poll Actions ---
  const addPollOption = () => setPollOptions([...pollOptions, ""]);
  const removePollOption = (index) => setPollOptions(pollOptions.filter((_, i) => i !== index));
  const updatePollOption = (text, index) => {
    const newOptions = [...pollOptions];
    newOptions[index] = text;
    setPollOptions(newOptions);
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      setUploading(true);
      const selected = result.assets[0];
      const formData = new FormData();

      if (Platform.OS === 'web') {
        const response = await fetch(selected.uri);
        const blob = await response.blob();
        formData.append("file", blob, selected.fileName || "upload.jpg");
      } else {
        formData.append("file", {
          uri: selected.uri,
          name: selected.fileName || (selected.type === "video" ? "video.mp4" : "photo.jpg"),
          type: selected.type === "video" ? "video/mp4" : "image/jpeg",
        });
      }

      try {
        const res = await fetch(`${API_BASE}/upload`, { method: "POST", body: formData });
        const data = await res.json();
        if (res.ok) {
          setMediaUrl(data.url);
          setMediaType(selected.type === "video" ? "video" : "image");
        } else {
          throw new Error(data.message);
        }
      } catch (err) {
        Alert.alert("Error", "Upload failed: " + err.message);
      } finally {
        setUploading(false);
      }
    }
  };

  const handleSubmit = async () => {
    if (!title.trim() || !message.trim()) {
      Alert.alert("Error", "Title and Message are required.");
      return;
    }

    setSubmitting(true);
    try {
      const mediaToSend = mediaUrl || mediaUrlLink || null;
      const typeToSend = mediaUrl
        ? mediaType
        : mediaUrlLink
          ? (mediaUrlLink.includes("video") || mediaUrlLink.includes("tiktok") ? "video" : "image")
          : "image";

      const response = await fetch(`${API_BASE}/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          message,
          category,
          mediaUrl: mediaToSend,
          mediaType: typeToSend,
          hasPoll,
          pollMultiple,
          pollOptions: hasPoll
            ? pollOptions.filter(opt => opt.trim() !== "").map(opt => ({ text: opt }))
            : [],
          fingerprint: fingerprint
        }),
      });

      const data = await response.json();

      if (response.status === 429) {
        Alert.alert("Daily Limit", "You have already posted in the last 24 hours.");
        checkDailyStatus(); // Refresh the UI to show the status card
        return;
      }

      if (!response.ok) throw new Error(data.message || "Failed to create post");

      Alert.alert("Success", "Your entry has been submitted for approval!");

      // Refresh status to show the "Pending" view
      checkDailyStatus();

    } catch (err) {
      Alert.alert("Error", err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (contextLoading || checkingStatus) {
    return (
      <View className="flex-1 justify-center items-center bg-white dark:bg-gray-950">
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-white dark:bg-gray-950"
      contentContainerStyle={{ padding: 20, paddingTop: 60, paddingBottom: 100 }}
    >
      <View className="flex-row justify-between items-center mb-6">
        <Text className="text-2xl font-bold dark:text-white">Welcome, {user?.username} 👋</Text>
      </View>

      <View className="h-[1px] bg-gray-200 dark:bg-gray-800 mb-6" />

      {todayPost ? (
        /* --- STATUS CARD: Handles Pending, Approved, and Rejected --- */
        <View
          className={`p-6 rounded-3xl border items-center ${todayPost.status === 'rejected'
              ? 'bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-900/30'
              : 'bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/30'
            }`}
        >
          <View
            className={`w-16 h-16 rounded-full items-center justify-center mb-4 ${todayPost.status === 'rejected' ? 'bg-red-100 dark:bg-red-800/30' : 'bg-blue-100 dark:bg-blue-800/30'
              }`}
          >
            <Ionicons
              name={
                todayPost.status === 'rejected'
                  ? "close-circle"
                  : todayPost.status === 'pending'
                    ? "time"
                    : "checkmark-circle"
              }
              size={32}
              color={todayPost.status === 'rejected' ? "#ef4444" : "#3b82f6"}
            />
          </View>

          <Text className="text-xl font-bold dark:text-white text-center">
            Daily Entry: {todayPost?.status ? (todayPost.status.charAt(0).toUpperCase() + todayPost.status.slice(1)) : "Pending"}
          </Text>

          <Text className="text-gray-600 dark:text-gray-400 text-center mt-2 leading-6">
            {todayPost.status === 'pending' &&
              "Your post is currently being reviewed by our team. It will appear on the feed once approved."}

            {todayPost.status === 'approved' &&
              "Your post is live! You've completed your diary entry for today. Come back in 24 hours for your next post."}

            {todayPost.status === 'rejected' &&
              "Unfortunately, your post was not approved for the feed. You can try again tomorrow with a new entry that follows our community guidelines."}
          </Text>

          <TouchableOpacity
            onPress={() => router.push("/")}
            className={`mt-6 bg-white dark:bg-gray-900 px-6 py-3 rounded-xl border ${todayPost.status === 'rejected' ? 'border-red-200 dark:border-red-800' : 'border-blue-200 dark:border-blue-800'
              }`}
          >
            <Text className={todayPost.status === 'rejected' ? "text-red-600 font-bold" : "text-blue-600 font-bold"}>
              {todayPost.status === 'rejected' ? "View Guidelines" : "Go to Feed"}
            </Text>
          </TouchableOpacity>
        </View>) : (
        /* --- POST FORM: Shown only if they haven't posted --- */
        <View>
          <Text className="text-xl font-semibold mb-4 dark:text-gray-200">Create New Post</Text>
          <View className="space-y-5">
            <TextInput
              placeholder="Post Title"
              value={title}
              onChangeText={setTitle}
              placeholderTextColor="#9ca3af"
              className="w-full border border-gray-200 dark:border-gray-800 p-4 rounded-xl dark:text-white bg-gray-50 dark:bg-gray-900"
            />

            <View>
              <Text className="text-gray-500 dark:text-gray-400 text-xs mb-2 leading-5">
                Use <Text className="font-bold">[section]</Text> for sections, <Text className="font-bold">[h]</Text> for headings.
              </Text>
              <TextInput
                placeholder="Write your main message here..."
                value={message}
                onChangeText={setMessage}
                multiline
                className="border border-gray-200 dark:border-gray-800 p-4 rounded-xl dark:text-white bg-gray-50 dark:bg-gray-900 h-64"
                style={{ textAlignVertical: 'top' }}
              />
            </View>

            {/* Category Selection */}
            <View>
              <Text className="dark:text-white font-medium mb-2">Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
                {["News", "Memes", "Videos/Edits", "Polls", "Gaming", "Review"].map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => setCategory(cat)}
                    className={`mr-2 px-5 py-2 rounded-full border ${category === cat ? 'bg-blue-600 border-blue-600' : 'bg-transparent border-gray-300 dark:border-gray-700'}`}
                  >
                    <Text className={category === cat ? "text-white font-bold" : "text-gray-600 dark:text-gray-400"}>{cat}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Media Section */}
            <View className="space-y-3">
              <TextInput
                placeholder="TikTok / External URL (optional)"
                value={mediaUrlLink}
                onChangeText={setMediaUrlLink}
                placeholderTextColor="#9ca3af"
                className="border border-gray-200 dark:border-gray-800 p-4 rounded-xl dark:text-white bg-gray-50 dark:bg-gray-900"
              />

              <TouchableOpacity
                onPress={pickImage}
                className="bg-blue-50 dark:bg-blue-900/10 p-5 rounded-xl items-center border-2 border-dashed border-blue-200 dark:border-blue-800"
              >
                {uploading ? <ActivityIndicator color="#3b82f6" /> : (
                  <View className="flex-row items-center">
                    <Ionicons name="cloud-upload-outline" size={20} color="#3b82f6" />
                    <Text className="text-blue-600 dark:text-blue-400 font-bold ml-2">Attach Local File</Text>
                  </View>
                )}
              </TouchableOpacity>

              {mediaUrl && (
                <View className="p-3 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-100 dark:border-green-900">
                  <Text className="text-green-700 dark:text-green-400 text-xs">Media ready for upload</Text>
                </View>
              )}
            </View>

            {/* Poll Section */}
            <View className="bg-gray-50 dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="dark:text-white font-bold text-lg">Add a poll</Text>
                <Switch value={hasPoll} onValueChange={setHasPoll} trackColor={{ true: '#3b82f6' }} />
              </View>

              {hasPoll && (
                <View className="space-y-3">
                  {pollOptions.map((option, i) => (
                    <View key={i} className="flex-row items-center gap-2">
                      <TextInput
                        placeholder={`Option ${i + 1}`}
                        value={option}
                        onChangeText={(t) => updatePollOption(t, i)}
                        className="flex-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-3 rounded-lg dark:text-white"
                      />
                      {pollOptions.length > 2 && (
                        <TouchableOpacity onPress={() => removePollOption(i)}>
                          <Ionicons name="trash-outline" size={20} color="#ef4444" />
                        </TouchableOpacity>
                      )}
                    </View>
                  ))}
                  <TouchableOpacity
                    onPress={addPollOption}
                    className="bg-green-500/10 p-3 rounded-lg items-center border border-green-500/20"
                  >
                    <Text className="text-green-600 font-bold">+ Add Option</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            <TouchableOpacity
              onPress={handleSubmit}
              disabled={submitting || uploading}
              className={`bg-blue-600 p-5 rounded-2xl items-center mt-4 mb-10 shadow-lg shadow-blue-500/30 ${submitting ? 'opacity-70' : ''}`}
            >
              {submitting ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-bold text-lg">Submit Entry</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
  );
}