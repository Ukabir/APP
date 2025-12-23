import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Alert, Animated, Pressable, ScrollView, TextInput, View } from "react-native";
import useSWR from "swr";
import { useUser } from "../context/UserContext";
import { Text } from "./Text";

const API_URL = "https://oreblogda.com";

// --- Skeleton Component ---
const CommentSkeleton = () => {
  const opacity = new Animated.Value(0.3);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.7, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <View className="mb-6 pl-4 border-l-2 border-gray-100 dark:border-gray-800">
      <Animated.View style={{ opacity }} className="h-5 w-32 bg-gray-200 dark:bg-gray-800 rounded-md mb-2" />
      <Animated.View style={{ opacity }} className="h-4 w-full bg-gray-100 dark:bg-gray-800 rounded-md mb-1" />
      <Animated.View style={{ opacity }} className="h-4 w-2/3 bg-gray-100 dark:bg-gray-800 rounded-md" />
    </View>
  );
};

// --- Single Comment ---
const SingleComment = ({ comment, onReply, depth = 0 }) => {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [replyText, setReplyText] = useState("");

  const hasReplies = comment.replies && comment.replies.length > 0;

  return (
    <View
      style={{ marginLeft: depth > 0 ? 15 : 0 }}
      className={`mb-5 border-l-2 ${depth === 0 ? 'border-gray-200 dark:border-gray-700' : 'border-gray-100 dark:border-gray-800'} pl-4`}
    >
      <Text className="text-lg font-bold text-[#171717] dark:text-[#ededed]">{comment.name}</Text>
      <Text className="text-base text-gray-700 dark:text-gray-300 mt-2 leading-6">{comment.text}</Text>

      <View className="flex-row items-center mt-3 gap-6">
        <Text className="text-gray-500 text-xs">{new Date(comment.date).toLocaleDateString()}</Text>
        <Pressable onPress={() => setShowReplyInput(!showReplyInput)} className="bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-md">
          <Text className="text-gray-700 dark:text-gray-300 text-sm font-bold">Reply</Text>
        </Pressable>
        {hasReplies && (
          <Pressable onPress={() => setIsCollapsed(!isCollapsed)} className="flex-row items-center">
            <Ionicons name={isCollapsed ? "chevron-down" : "chevron-up"} size={16} color="#3b82f6" />
            <Text className="text-gray-700 dark:text-gray-300 text-sm font-bold ml-1">
              {isCollapsed ? `Show ${comment.replies.length} replies` : "Hide replies"}
            </Text>
          </Pressable>
        )}
      </View>

      {showReplyInput && (
        <View className="mt-4 flex-row gap-2 bg-gray-50 dark:bg-gray-900 p-2 rounded-xl border border-gray-200 dark:border-gray-800">
          <TextInput
            placeholder="Write a reply..."
            placeholderTextColor="#9ca3af"
            className="flex-1 p-3 text-base dark:text-white"
            value={replyText}
            autoFocus
            onChangeText={setReplyText}
            style={{ outlineStyle: 'none' }}
          />
          <Pressable
            onPress={() => {
              if (replyText.trim()) onReply(comment._id, replyText);
              setReplyText("");
              setShowReplyInput(false);
              setIsCollapsed(false);
            }}
            className="bg-blue-600 px-3 justify-center rounded-lg"
          >
            <Text className="text-white text-xs font-bold">Send</Text>
          </Pressable>
        </View>
      )}

      {!isCollapsed && hasReplies && (
        <View className="mt-4">
          {comment.replies.map((reply) => (
            <SingleComment key={reply._id} comment={reply} onReply={onReply} depth={depth + 1} />
          ))}
        </View>
      )}
    </View>
  );
};

// --- Main Comment Section ---
export default function CommentSection({ postId }) {
  const { user } = useUser();
  const [text, setText] = useState("");
  const [isPosting, setIsPosting] = useState(false);

  // SWR with auto-refresh every 5s and revalidate on focus
  const { data, mutate, error, isLoading } = useSWR(
    user?.deviceId ? `${API_URL}/api/posts/${postId}/comment` : null,
    (url) => fetch(url).then(res => res.json()),
    { refreshInterval: 5000, revalidateOnFocus: true }
  );
  
  const comments = data?.comments || [];

  const handlePostComment = async (parentId = null, replyContent = null) => {
    const content = replyContent || text;
    if (!content.trim() || !user?.deviceId) return;

    setIsPosting(true);

    try {
      const res = await fetch(`${API_URL}/api/posts/${postId}/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: user?.username || "Anonymous",
          text: content,
          parentCommentId: parentId,
          fingerprint: user.deviceId,
          userId: user._id || null
        }),
      });

      const data = await res.json();

      if (res.ok) {
        // Optimistic UI update
        if (parentId) {
          // reply
          mutate({
            comments: comments.map(c => {
              if (c._id === parentId) {
                return { ...c, replies: [...(c.replies || []), {
                  _id: data.commentId,
                  name: user.username,
                  text: content,
                  date: new Date().toISOString(),
                  replies: []
                }]};
              }
              return c;
            })
          }, false);
        } else {
          // new top-level comment
          mutate({
            comments: [
              ...comments,
              {
                _id: data.commentId,
                name: user.username,
                text: content,
                date: new Date().toISOString(),
                replies: []
              }
            ]
          }, false);
          setText("");
        }
      } else {
        Alert.alert("Error", data.message || "Could not post comment.");
      }

    } catch (err) {
      console.error("Comment POST error:", err);
      Alert.alert("Error", "Could not post comment.");
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <View className="bg-white dark:bg-[#111827] p-6 rounded-3xl border border-gray-100 dark:border-gray-800 mt-4">
      <Text className="text-2xl font-bold mb-6 text-[#171717] dark:text-[#ededed]">
        Discussion ({comments.length})
      </Text>

      {/* Main Input Field */}
      <View className="flex-row gap-3 mb-8 items-end">
        <View className="flex-1 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-2">
          <TextInput
            placeholder="Add to the story..."
            placeholderTextColor="#9ca3af"
            value={text}
            onChangeText={setText}
            multiline
            className="p-3 text-lg dark:text-white min-h-[50px]"
            style={{ textAlignVertical: 'top', outlineStyle: 'none' }}
          />
        </View>
        <Pressable
          onPress={() => handlePostComment()}
          disabled={isPosting}
          className={`bg-blue-600 p-4 h-fit w-fit rounded-2xl justify-center items-center ${isPosting ? 'opacity-50' : ''}`}
        >
          <Ionicons name="send" size={24} color="white" />
        </Pressable>
      </View>

      <ScrollView
        style={{ maxHeight: 300 }}
        nestedScrollEnabled={true}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <>
            <CommentSkeleton />
            <CommentSkeleton />
            <CommentSkeleton />
          </>
        ) : (
          comments.map((c) => (
            <SingleComment key={c._id} comment={c} onReply={handlePostComment} />
          ))
        )}
      </ScrollView>
    </View>
  );
}
