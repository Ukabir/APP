import { Feather, Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Video } from "expo-av";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    Alert,
    Image,
    Modal,
    Pressable,
    Share,
    TextInput,
    useColorScheme,
    View
} from "react-native";
import { WebView } from "react-native-webview";

// Components & Context
import { useUser } from "../context/UserContext";
import Poll from "./Poll";
import { Text } from "./Text";

export default function PostCard({ post, setPosts, isFeed, hideComments = false, hideMedia }) {
    const router = useRouter();
    const { user } = useUser();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === "dark";

    // State
    const [liked, setLiked] = useState(false);
    const [commentText, setCommentText] = useState("");
    const [showCommentInput, setShowCommentInput] = useState(false);
    const [lightbox, setLightbox] = useState({ open: false, src: null, type: null });
    const [author, setAuthor] = useState({ name: post.authorName, image: null });

    // Stats
    const [totalLikes, setTotalLikes] = useState(post?.likes?.length || 0);
    const totalComments = post?.comments?.length || 0;
    const totalShares = post?.shares || 0;
    const totalViews = post?.views || 0;

    // 1. Initial Sync: Check if current device has liked this post
    useEffect(() => {
        if (user?.deviceId && post.likes?.includes(user.deviceId)) {
            setLiked(true);
        }
    }, [post.likes, user?.deviceId]);

    // 2. Author Fetching
    useEffect(() => {
        const fetchAuthor = async () => {
            try {
                const res = await fetch(`https://oreblogda.vercel.app/api/users/${post.authorId}`);
                if (res.ok) {
                    const data = await res.json();

                    setAuthor({
                        name: data.name || post.authorName,
                        image: data.user?.profilePic?.url
                    });
                }
            } catch (err) {
                console.log("Author fetch error:", err);
            }
        };
        if (post.authorId) fetchAuthor();
    }, [post.authorId]);

    // 3. View Tracking (Once per device)
    useEffect(() => {
        if (!post?._id || !user?.deviceId) return;

        const handleView = async () => {
            const viewedKey = "viewedPosts";
            const viewed = JSON.parse((await AsyncStorage.getItem(viewedKey)) || "[]");

            if (!viewed.includes(post._id)) {
                try {
                    const res = await fetch(`https://oreblogda.vercel.app/api/posts/${post._id}`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ action: "view", fingerprint: user.deviceId }),
                    });
                    const data = await res.json();
                    refreshPosts(data);
                    await AsyncStorage.setItem(viewedKey, JSON.stringify([...viewed, post._id]));
                } catch (err) {
                    console.error("View track err:", err);
                }
            }
        };
        handleView();
    }, [post?._id, user?.deviceId]);

    const refreshPosts = (updatedPost) => {
        if (setPosts) {
            setPosts((prev) =>
                Array.isArray(prev)
                    ? prev.map((p) => (p._id === updatedPost._id ? updatedPost : p))
                    : updatedPost
            );
        }
    };

    const handleLike = async () => {
        if (liked || !user) {
            if (!user) Alert.alert("Hold on", "Please register to interact with posts.");
            return;
        };

        setLiked(true);
        setTotalLikes((prev) => prev + 1);

        try {
            const res = await fetch(`https://oreblogda.vercel.app/api/posts/${post._id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "like", fingerprint: user.deviceId }),
            });
            const data = await res.json();
            refreshPosts(data);
        } catch (err) {
            setLiked(false);
            setTotalLikes((prev) => prev - 1);
        }
    };

    const handleAddComment = async () => {
        if (!commentText.trim() || !user) return;

        try {
            const res = await fetch(`https://oreblogda.vercel.app/api/posts/${post._id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "comment",
                    payload: { name: user.username, text: commentText },
                    fingerprint: user.deviceId,
                }),
            });
            const data = await res.json();
            refreshPosts(data);
            setCommentText("");
            setShowCommentInput(false);
        } catch (err) {
            Alert.alert("Error", "Could not post comment.");
        }
    };

    const handleNativeShare = async () => {
        try {
            const url = `https://oreblogda.vercel.app/post/${post.slug || post._id}`;
            await Share.share({
                message: `Check out this post on Oreblogda: ${post.title}\n${url}`,
                url: url,
            });
            // Optionally track share count on backend
            fetch(`https://oreblogda.vercel.app/api/posts/${post._id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "share", fingerprint: user.deviceId }),
            });
        } catch (error) {
            console.log(error.message);
        }
    };

    // --- Message Rendering Logic ---
    const parseMessageSections = (msg) => {
        const regex = /\[section\](.*?)\[\/section\]|\[h\](.*?)\[\/h\]|\[li\](.*?)\[\/li\]|\[br\]/gs;
        const parts = [];
        let lastIndex = 0;
        let match;
        while ((match = regex.exec(msg)) !== null) {
            if (match.index > lastIndex) parts.push({ type: "text", content: msg.slice(lastIndex, match.index) });
            if (match[1] !== undefined) parts.push({ type: "section", content: match[1] });
            else if (match[2] !== undefined) parts.push({ type: "heading", content: match[2] });
            else if (match[3] !== undefined) parts.push({ type: "listItem", content: match[3] });
            else parts.push({ type: "br" });
            lastIndex = regex.lastIndex;
        }
        if (lastIndex < msg.length) parts.push({ type: "text", content: msg.slice(lastIndex) });
        return parts;
    };

    const renderContent = () => {
        const maxLength = 150;

        if (isFeed) {
            let plainText = post.message.replace(
                /\[section\](.*?)\[\/section\]|\[h\](.*?)\[\/h\]|\[li\](.*?)\[\/li\]|\[br\]/gs,
                ""
            );
            plainText = plainText.replace(/\s+/g, " ").trim();

            const truncated =
                plainText.length > maxLength
                    ? plainText.slice(0, maxLength) + "..."
                    : plainText;

            return (
                <Text className="text-base text-gray-700 dark:text-gray-300">
                    {truncated}
                </Text>
            );
        }

        const parts = parseMessageSections(post.message);

        return (
            <View style={{display: "inline", }} className="leading-6 d-inline">
                {parts.map((p, i) => {
                    switch (p.type) {
                        case "text":
                            return (
                                <Text key={i} className="text-base">
                                    {p.content}
                                </Text>
                            );

                        case "br":
                            return <View key={i} className="h-2" />;

                        case "heading":
                            return (
                                <Text
                                    key={i}
                                    className="text-xl font-bold mt-3"
                                >
                                    {p.content}
                                </Text>
                            );

                        case "listItem":
                            return (
                                <View key={i} className="flex-row items-start ml-4">
                                    <Text className="mr-2">•</Text>
                                    <Text className="flex-1 text-base">{p.content}</Text>
                                </View>
                            );

                        case "section":
                            return (
                                <View
                                    key={i}
                                    className="bg-gray-100 dark:bg-gray-700 p-2 my-1 ml-4 rounded-md border-l-4 border-blue-500 max-w-[90%]"
                                >
                                    <Text className="text-base">{p.content}</Text>
                                </View>
                            );

                        default:
                            return null;
                    }
                })}
            </View>
        );
    };


    const renderMediaContent = () => {
        if (hideMedia || !post.mediaUrl) return null;
        const isVideo = post.mediaType?.startsWith("video") || post.mediaUrl.match(/\.(mp4|mov|m4v)$/i);

        if (post.mediaUrl.includes("tiktok.com")) {
            return (
                <View className="max-h-[600px] w-full rounded-2xl overflow-hidden my-2">
                    <WebView source={{ uri: post.mediaUrl }} scrollEnabled={false} allowsFullscreenVideo />
                </View>
            );
        }

        return (
            <Pressable
                onPress={() => setLightbox({ open: true, src: post.mediaUrl, type: isVideo ? "video" : "image" })}
                className="my-2 rounded-2xl overflow-hidden shadow-sm"
            >
                {isVideo ? (
                    <Video
                        source={{ uri: post.mediaUrl }}
                        style={{ width: '100%', height: 250 }}
                        useNativeControls
                        resizeMode="cover"
                    />
                ) : (
                    <Image source={{ uri: post.mediaUrl }} style={{ width: '100%', height: 300 }} className="max-h-full" resizeMode="cover" />
                )}
            </Pressable>
        );
    };

    return (
        <View className="bg-white dark:bg-gray-900 rounded-lg p-4 mb-5 shadow-sm border border-gray-100 dark:border-gray-800">

            {/* Header: Author & Views */}
            <View className="flex-row justify-between items-center">
                <Pressable
                    onPress={() => router.push(`/author/${post.authorId}`)}
                    className="flex-row items-center"
                >
                    {author.image ? (
                        <Image
                            source={{ uri: author.image }}
                            // Use style for dimensions to ensure they always render
                            style={{ width: 40, height: 40, borderRadius: 20 }}
                            className="bg-gray-200 mr-2"
                            resizeMode="cover"
                        />
                    ) : (
                        <View
                            style={{ width: 40, height: 40, borderRadius: 20 }}
                            className="bg-blue-500 mr-2 items-center justify-center"
                        >
                            <Text className="text-white font-space-bold">
                                {author.name?.charAt(0).toUpperCase() || "?"}
                            </Text>
                        </View>
                    )}

                    <View className="">
                        <Text className="font-space-bold text-gray-900 dark:text-white text-base">
                            {author.name || "Anonymous"}
                        </Text>
                        <Text className="text-gray-400 text-xs font-space">Post Author</Text>
                    </View>
                </Pressable>
                <View className="flex-row items-center bg-gray-50 dark:bg-gray-800 px-3 py-1 rounded-full">
                    <Feather name="eye" size={12} color="#9ca3af" />
                    <Text className="ml-1.5 text-gray-500 text-xs font-medium">{totalViews}</Text>
                </View>
            </View>

            {/* Body: Title & Text */}
            <Pressable onPress={() => isFeed && router.push(`/post/${post.slug || post._id}`)}>
                <Text className="text-2xl font-black text-gray-900 dark:text-white mb-2 leading-tight">
                    {post?.title}
                </Text>
                <View className="mb-1">{renderContent()}</View>
            </Pressable>

            {renderMediaContent()}

            {post.poll && <Poll poll={post.poll} postId={post._id} deviceId={user?.deviceId} />}

            {/* Action Footer */}
            <View className="flex-row items-center justify-between border-t border-gray-50 dark:border-gray-800 pt-2 mt-2">
                <View className="flex-row items-center gap-2 space-x-6">
                    <Pressable onPress={handleLike} disabled={liked} className="flex-row items-center">
                        <Ionicons
                            // If liked, use "heart" (filled). If not, use "heart-outline"
                            name={liked ? "heart" : "heart-outline"}
                            size={22}
                            color={liked ? "#ef4444" : isDark ? "#fff" : "#1f2937"}
                        />
                        <Text className={`ml-1 font-bold ${liked ? "text-red-500" : "text-gray-600 dark:text-gray-400"}`}>{totalLikes}</Text>
                    </Pressable>

                    <Pressable onPress={() => setShowCommentInput(!showCommentInput)} className="flex-row items-center">
                        <Feather name="message-circle" size={20} color={isDark ? "#fff" : "#1f2937"} />
                        <Text className="ml-1 font-bold text-gray-600 dark:text-gray-400">{totalComments}</Text>
                    </Pressable>
                </View>

                <Pressable onPress={handleNativeShare} className="p-2 bg-gray-50 dark:bg-gray-800 rounded-full">
                    <Feather name="share-2" size={18} color={isDark ? "#fff" : "#1f2937"} />
                </Pressable>
            </View>

            {/* Comment Section */}
            {showCommentInput && (
                <View className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl">
                    <Text className="text-xs text-gray-400 mb-2 uppercase tracking-widest font-bold">
                        Commenting as <Text className="text-blue-500">{user?.username || "Guest"}</Text>
                    </Text>
                    <TextInput
                        placeholder="What's your take?"
                        placeholderTextColor="#9ca3af"
                        value={commentText}
                        onChangeText={setCommentText}
                        style={{ outlineStyle: 'none' }}
                        multiline
                        className="text-gray-900 dark:text-white text-base py-2"
                    />
                    <Pressable
                        onPress={handleAddComment}
                        className="mt-3 bg-blue-600 py-3 rounded-xl items-center shadow-sm"
                    >
                        <Text className="text-white font-bold">Post Comment</Text>
                    </Pressable>
                </View>
            )}

            {/* Lightbox Modal */}
            <Modal visible={lightbox.open} transparent animationType="fade">
                <Pressable className="flex-1 bg-black/95 justify-center items-center" onPress={() => setLightbox({ ...lightbox, open: false })}>
                    <Pressable className="absolute top-12 right-6 p-2 bg-white/10 rounded-full">
                        <Feather name="x" size={24} color="white" />
                    </Pressable>
                    {lightbox.type === "image" ? (
                        <Image source={{ uri: lightbox.src }} className="w-full h-[80%]" resizeMode="contain" />
                    ) : (
                        <Video source={{ uri: lightbox.src }} className="w-full h-[80%]" useNativeControls resizeMode="contain" shouldPlay />
                    )}
                </Pressable>
            </Modal>
        </View>
    );
}