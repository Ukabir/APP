import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from 'expo-image-picker';
import { useRootNavigationState, useRouter } from "expo-router";
import { useState } from "react";
import {
	ActivityIndicator, Alert,
	Linking,
	Platform,
	ScrollView,
	StatusBar,
	Switch, TextInput, TouchableOpacity,
	View
} from "react-native";
import useSWR from "swr";
import { useUser } from "../../context/UserContext";
import { Text } from "./../../components/Text";
const API_BASE = "https://oreblogda.vercel.app/api";
const fetcher = (url) => fetch(url).then((res) => res.json());

export default function AuthorDiaryDashboard() {
  const { user, loading: contextLoading, setUser } = useUser();
  const rootNavigationState = useRootNavigationState();
  const fingerprint = user?.deviceId;
  const router = useRouter();

  // Form States
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState("News");
  const [mediaUrl, setMediaUrl] = useState("");
  const [mediaUrlLink, setMediaUrlLink] = useState("");
  const [mediaType, setMediaType] = useState("image");

  // Selection & Preview States
  const [selection, setSelection] = useState({ start: 0, end: 0 });
  const [showPreview, setShowPreview] = useState(false);

  // Poll States
  const [hasPoll, setHasPoll] = useState(false);
  const [pollMultiple, setPollMultiple] = useState(false);
  const [pollOptions, setPollOptions] = useState(["", ""]);

  // System States
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // --- SWR for today's post ---
  const { data: todayPostData, mutate: mutateTodayPost } = useSWR(
    user?.deviceId ? `${API_BASE}/posts?author=${user.deviceId}&limit=1` : null,
    fetcher,
    { refreshInterval: 5000 } // auto-refresh every 5s
  );

  const todayPost = todayPostData?.posts?.[0] || null;
  // --- Poll Actions --- 
  const addPollOption = () => setPollOptions([...pollOptions, ""]); const removePollOption = (index) => setPollOptions(pollOptions.filter((_, i) => i !== index)); const updatePollOption = (text, index) => { const newOptions = [...pollOptions]; newOptions[index] = text; setPollOptions(newOptions); };

const parseMessageSections = (msg) => {
    const regex = /\[section\](.*?)\[\/section\]|\[h\](.*?)\[\/h\]|\[li\](.*?)\[\/li\]|\[source="(.*?)" text:(.*?)\]|\[br\]/gs;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(msg)) !== null) {
        if (match.index > lastIndex) {
            parts.push({ type: "text", content: msg.slice(lastIndex, match.index) });
        }
        if (match[1] !== undefined) parts.push({ type: "section", content: match[1].trim() });
        else if (match[2] !== undefined) parts.push({ type: "heading", content: match[2].trim() });
        else if (match[3] !== undefined) parts.push({ type: "listItem", content: match[3].trim() });
        else if (match[4] !== undefined) parts.push({ type: "link", url: match[4], content: match[5] });
        else parts.push({ type: "br" });
        lastIndex = regex.lastIndex;
    }
    if (lastIndex < msg.length) parts.push({ type: "text", content: msg.slice(lastIndex) });
    return parts;
};

const renderPreviewContent = () => {
    const mobileStyle = { includeFontPadding: false, textAlignVertical: 'center' };

    const handlePress = async (url) => {
        const supported = await Linking.canOpenURL(url);
        if (supported) await Linking.openURL(url);
        else Alert.alert("Invalid Link", "Cannot open this URL");
    };

    const rawParts = parseMessageSections(message);
    const finalElements = [];
    let inlineBuffer = []; // This will hold Text and Links together

    const flushInlineBuffer = (key) => {
        if (inlineBuffer.length > 0) {
            finalElements.push(
                <Text 
                    key={`inline-${key}`} 
                    style={[mobileStyle, { whiteSpace: 'pre-wrap' }]} 
                    className="text-base leading-6 text-gray-800 dark:text-gray-200"
                >
                    {inlineBuffer}
                </Text>
            );
            inlineBuffer = [];
        }
    };

    rawParts.forEach((p, i) => {
        if (p.type === "text") {
            inlineBuffer.push(p.content);
        } else if (p.type === "br") {
            inlineBuffer.push("\n");
        } else if (p.type === "link") {
            // Push the clickable text DIRECTLY into the buffer to keep it inline
            inlineBuffer.push(
                <Text
                    key={`link-${i}`}
                    onPress={() => handlePress(p.url)}
                    className="text-blue-500 font-bold underline"
                    style={{ lineHeight: 24 }}
                >
                    {p.content}
                </Text>
            );
        } else {
            // Block elements (Heading, Section, List) need the buffer flushed first
            flushInlineBuffer(i);

            if (p.type === "heading") {
                finalElements.push(
                    <Text key={i} style={mobileStyle} className="text-xl font-bold mt-4 mb-1 text-black dark:text-white">
                        {p.content}
                    </Text>
                );
            } else if (p.type === "listItem") {
                finalElements.push(
                    <View key={i} className="flex-row items-start ml-4 my-0.5">
                        <Text style={mobileStyle} className="mr-2 text-base">•</Text>
                        <Text style={mobileStyle} className="flex-1 text-base leading-6">{p.content}</Text>
                    </View>
                );
            } else if (p.type === "section") {
                finalElements.push(
                    <View key={i} className="bg-gray-100 dark:bg-gray-700 px-3 py-2.5 my-2 rounded-md border-l-4 border-blue-500">
                        <Text style={mobileStyle} className="text-base italic leading-6">{p.content}</Text>
                    </View>
                );
            }
        }
    });

    flushInlineBuffer("end");

    return <View className="px-4 py-1">{finalElements}</View>;
};

  const sanitizeMessage = (text) => {
    const patterns = [
      /\[section][\s\S]*?\[\/section]/g,
      /\[h][\s\S]*?\[\/h]/g,
      /\[li][\s\S]*?\[\/li]/g,
    ];
    let cleaned = text;
    patterns.forEach((pattern) => {
      const matches = cleaned.match(pattern);
      if (!matches) return;
      matches.forEach((block) => {
        const isBroken =
          !block.startsWith("[section]") && block.includes("section") ||
          !block.startsWith("[h]") && block.includes("[h") ||
          !block.startsWith("[li]") && block.includes("[li");
        if (isBroken) cleaned = cleaned.replace(block, "");
      });
    });
    return cleaned;
  };

  const insertTag = (tagType) => {
    let tagOpen = "", tagClose = "";
    switch (tagType) {
      case 'section': tagOpen = "[section]\n Input Section Text here"; tagClose = "\n[/section]"; break;
      case 'heading': tagOpen = "[h]Input heading here"; tagClose = "[/h]"; break;
      case 'link': tagOpen = "[source=\"input link here\" text: Link Text here]"; tagClose = ""; break;
      case 'list': tagOpen = "[li]Add list here"; tagClose = "[/li]"; break;
    }
    const before = message.substring(0, selection.start);
    const after = message.substring(selection.end);
    const middle = message.substring(selection.start, selection.end);
    const newText = `${before}${tagOpen}${middle}${tagClose}${after}`;
    const cursorPosition = before.length + tagOpen.length + middle.length;
    setMessage(newText);
    setTimeout(() => setSelection({ start: cursorPosition, end: cursorPosition }), 10);
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
          fingerprint
        }),
      });
      const data = await response.json();
      if (response.status === 429) {
        Alert.alert("Daily Limit", "You have already posted in the last 24 hours.");
        mutateTodayPost(); // refresh SWR
        return;
      }
      if (!response.ok) throw new Error(data.message || "Failed to create post");

      Alert.alert("Success", "Your entry has been submitted for approval!");
      mutateTodayPost(); // refresh SWR

    } catch (err) {
      Alert.alert("Error", err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (contextLoading || !rootNavigationState?.key) {
    return (
      <View className="flex-1 justify-center items-center bg-white dark:bg-gray-900">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="mt-4 text-gray-500 animate-pulse">Syncing Diary...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white dark:bg-gray-900">
      <StatusBar barStyle="dark-content" />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          padding: 20,
          paddingBottom: 100
        }}
      >
        <View className="flex-row justify-between items-center mt-2 mb-6">
          <Text className="text-2xl font-bold dark:text-white">Welcome, {user?.username} 👋</Text>
        </View>

        <View className="h-[1px] bg-gray-200 dark:bg-gray-800 mb-6" />

        {todayPost ? (
          <View
            className={`p-6 rounded-3xl border items-center ${todayPost.status === 'rejected'
              ? 'bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-900/30'
              : 'bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/30'
              }`}
          >
            <View
              className={`w-16 h-16 rounded-full items-center justify-center mb-4 ${todayPost.status === 'rejected' ? 'bg-red-100 dark:bg-red-800/30' : 'bg-blue-100 dark:bg-blue-800/30'}`}
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
              {todayPost.status === 'pending' && "Your post is currently being reviewed by our team."}
              {todayPost.status === 'approved' && "Your post is live! Come back in 24 hours."}
              {todayPost.status === 'rejected' && "Unfortunately, your post was not approved. you will be able to make a new post in 12 hours."}
            </Text>

            <TouchableOpacity
              onPress={() => router.push(todayPost.status === 'rejected' ? "screens/Rules" : "/")}
              className={`mt-6 bg-white dark:bg-gray-900 px-6 py-3 rounded-xl border ${todayPost.status === 'rejected' ? 'border-red-200 dark:border-red-800' : 'border-blue-200 dark:border-blue-800'}`}
            >
              <Text className={todayPost.status === 'rejected' ? "text-red-600 font-bold" : "text-blue-600 font-bold"}>
                {todayPost.status === 'rejected' ? "View Rules for Post approval" : "Go to Feed"}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            {/* Header with Preview Toggle */}
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-semibold dark:text-gray-200">
                {showPreview ? "Previewing Entry" : "Create New Post"}
              </Text>
              <TouchableOpacity
                onPress={() => setShowPreview(!showPreview)}
                className="bg-blue-100 dark:bg-blue-900/30 px-4 py-2 rounded-full flex-row items-center"
              >
                <Ionicons name={showPreview ? "create-outline" : "eye-outline"} size={16} color="#3b82f6" style={{ marginRight: 6 }} />
                <Text className="text-blue-600 dark:text-blue-400 text-xs font-bold">
                  {showPreview ? "Edit Mode" : "Show Preview"}
                </Text>
              </TouchableOpacity>
            </View>

            {showPreview ? (
              <View className="mb-6">
                {renderPreviewContent()}
              </View>
            ) : (
              <View className="space-y-5">
                <TextInput
                  placeholder="Post Title"
                  value={title}
                  onChangeText={setTitle}
                  placeholderTextColor="#9ca3af"
                  className="w-full border border-gray-200 dark:border-gray-800 p-4 rounded-xl dark:text-white bg-gray-50 dark:bg-gray-900"
                />

                <View>
                  <Text className="text-gray-500 dark:text-gray-400 text-xs mb-2 leading-5">Tap to insert formatting:</Text>
                  <View className="flex-row flex-wrap gap-2 mb-3">
                    <TouchableOpacity onPress={() => insertTag('section')} className="bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700">
                      <Text className="text-blue-600 dark:text-blue-400 text-xs font-bold">[Section]</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => insertTag('heading')} className="bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700">
                      <Text className="text-blue-600 dark:text-blue-400 text-xs font-bold">[Heading]</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => insertTag('list')} className="bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700">
                      <Text className="text-blue-600 dark:text-blue-400 text-xs font-bold">[List Item]</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => insertTag('link')} className="bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700">
                      <Text className="text-blue-600 dark:text-blue-400 text-xs font-bold">[Add Link]</Text>
                    </TouchableOpacity>
                  </View>

                  <TextInput
                    placeholder="Write your main message here..."
                    value={message}
                    onChangeText={(text) => setMessage(sanitizeMessage(text))}
                    onSelectionChange={(e) => setSelection(e.nativeEvent.selection)}
                    multiline
                    className="border border-gray-200 dark:border-gray-800 p-4 rounded-xl dark:text-white bg-gray-50 dark:bg-gray-900 h-64"
                    style={{ textAlignVertical: 'top' }}
                    onKeyPress={({ nativeEvent }) => {
                      if (nativeEvent.key !== "Backspace") return;

                      // Helper to detect if cursor is inside a tag
                      const getBlockAtCursor = (text, cursor) => {
                        const blocks = [
                          { open: "[section]", close: "[/section]" },
                          { open: "[h]", close: "[/h]" },
                          { open: "[li]", close: "[/li]" },
                        ];
                        for (const { open, close } of blocks) {
                          const start = text.lastIndexOf(open, cursor - 1);
                          const end = text.indexOf(close, cursor);
                          if (start !== -1 && end !== -1 && cursor > start && cursor <= end + close.length) {
                            return { start, end: end + close.length };
                          }
                        }
                        return null;
                      };

                      const block = getBlockAtCursor(message, selection.start);
                      if (!block) return;

                      // Remove entire block
                      const before = message.slice(0, block.start);
                      const after = message.slice(block.end);
                      const newText = before + after;
                      setMessage(newText);

                      // Move cursor to start of removed block
                      setTimeout(() => setSelection({ start: block.start, end: block.start }), 10);
                    }}
                  />

                </View>

                {/* Category Selection */}
                <View className="my-4">
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
                    className="bg-blue-50 dark:bg-blue-900/10 p-5 rounded-xl items-center mt-5 border-2 border-dashed border-blue-200 dark:border-blue-800"
                  >
                    {uploading ? <ActivityIndicator color="#3b82f6" /> : (
                      <View className="flex-row items-center">
                        <Ionicons name="cloud-upload-outline" size={20} color="#3b82f6" />
                        <Text className="text-blue-600 dark:text-blue-400 font-bold ml-2">Attach Local File</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                </View>

                {/* Poll Section */}
                <View className="bg-gray-50 dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 mt-4">
                  <View className="flex-row justify-between items-center mb-4">
                    <Text className="dark:text-white font-bold text-lg">Add a poll</Text>
                    <Switch value={hasPoll} onValueChange={setHasPoll} trackColor={{ true: '#3b82f6' }} />
                  </View>
                  {hasPoll && (
                    <View className="space-y-3">
                      {pollOptions.map((option, i) => (
                        <View key={i} className="flex-row items-center gap-2 mb-2">
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
                      <TouchableOpacity onPress={addPollOption} className="bg-green-500/10 p-3 rounded-lg items-center border border-green-500/20">
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
                  {submitting ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-lg">Submit Entry</Text>}
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}