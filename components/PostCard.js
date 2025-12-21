import { Feather, Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Video } from "expo-av";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    Modal,
    Pressable,
    Share,
    useColorScheme,
    View
} from "react-native";
import { WebView } from "react-native-webview";
import useSWR from "swr";

// Components & Context
import { useUser } from "../context/UserContext";
import Poll from "./Poll";
import { Text } from "./Text";

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function PostCard({ post, setPosts, isFeed, hideMedia }) {
    const router = useRouter();
    const { user } = useUser();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === "dark";

    // Lightbox state
    const [lightbox, setLightbox] = useState({ open: false, src: null, type: null });
    const [liked, setLiked] = useState(false);
    const [author, setAuthor] = useState({ name: post.authorName, image: null });

    // SWR for live post stats
    const { data: postData, mutate } = useSWR(
        post?._id ? `https://oreblogda.vercel.app/api/posts/${post._id}` : null,
        fetcher,
        { refreshInterval: 10000 } // optional auto-refresh every 10s
    );

    const totalLikes = postData?.likes?.length || 0;
    const totalComments = postData?.comments?.length || 0;
    const totalShares = postData?.shares || 0;
    const totalViews = postData?.views || 0;

    // Fetch Author
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

    // View Tracking (Once per device)
    useEffect(() => {
        if (!post?._id || !user?.deviceId) return;

        const handleView = async () => {
            const viewedKey = "viewedPosts";
            const viewed = JSON.parse((await AsyncStorage.getItem(viewedKey)) || "[]");

            if (!viewed.includes(post._id)) {
                try {
                    await fetch(`https://oreblogda.vercel.app/api/posts/${post._id}`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ action: "view", fingerprint: user.deviceId }),
                    });
                    await AsyncStorage.setItem(viewedKey, JSON.stringify([...viewed, post._id]));
                    mutate(); // Refresh SWR data
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

    // Initial Sync: Check AsyncStorage for likes
    useEffect(() => {
        const checkLocalLikes = async () => {
            try {
                const savedLikes = await AsyncStorage.getItem('user_likes');
                const likedList = savedLikes ? JSON.parse(savedLikes) : [];

                if (likedList.includes(post?._id)) {
                    setLiked(true);
                } else if (user?.deviceId && post.likes?.some(l => l.fingerprint === user.deviceId)) {
                    setLiked(true);
                    const updatedList = [...likedList, post?._id];
                    await AsyncStorage.setItem('user_likes', JSON.stringify(updatedList));
                }
            } catch (e) {
                console.error("Local storage error", e);
            }
        };
        checkLocalLikes();
    }, [post?._id, post.likes, user?.deviceId]);

    // Handle Like
    const handleLike = async () => {
        if (liked || !user) {
            if (!user) Alert.alert("Hold on", "Please register to interact with posts.");
            router.replace("screens/FirstLaunchScreen");
            return;
        }

        try {
            // Optimistic UI update
            setLiked(true);
            mutate(
                { ...postData, likes: [...(postData?.likes || []), { fingerprint: user.deviceId }] },
                false
            );

            // Save to AsyncStorage
            const savedLikes = await AsyncStorage.getItem('user_likes');
            const likedList = savedLikes ? JSON.parse(savedLikes) : [];
            if (!likedList.includes(post?._id)) {
                likedList.push(post?._id);
                await AsyncStorage.setItem('user_likes', JSON.stringify(likedList));
            }

            // Sync with backend
            const res = await fetch(`https://oreblogda.vercel.app/api/posts/${post?._id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "like", fingerprint: user.deviceId }),
            });
            const data = await res.json();
            mutate(data); // Refresh SWR data
            refreshPosts(data);
        } catch (err) {
            console.error("Like sync failed", err);
        }
    };

    // Handle Share
    const handleNativeShare = async () => {
        try {
            const url = `https://oreblogda.vercel.app/post/${post?.slug || post?._id}`;
            await Share.share({
                message: `Check out this post on Oreblogda: ${post?.title}\n${url}`,
                url,
            });

            // Track share
            await fetch(`https://oreblogda.vercel.app/api/posts/${post?._id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "share", fingerprint: user.deviceId }),
            });
            mutate(); // Refresh SWR data
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
            <View style={{ display: "inline", }} className="leading-6 d-inline">
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
                                <Text key={i} className="text-xl font-bold mt-3">
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

    const getTikTokEmbedUrl = (url) => {
        if (!url) return "";
        if (url.includes("tiktok.com/embed/")) return url;
        try {
            const match = url.match(/\/video\/(\d+)/);
            if (match && match[1]) return `https://www.tiktok.com/embed/${match[1]}`;
            return url;
        } catch (err) {
            return url;
        }
    };

    const renderMediaContent = () => {
        if (!post?.mediaUrl) return null;
        const url = post.mediaUrl.toLowerCase();
        const isTikTok = url.includes("tiktok.com");
        const isVideo = post.mediaType?.startsWith("video") || url.match(/\.(mp4|mov|m4v)$/i);

        if (isTikTok) {
            return (
                <View className="w-full rounded-2xl overflow-hidden my-2 bg-black relative" style={{ height: 600 }}>
                    <WebView
                        source={{ uri: getTikTokEmbedUrl(post.mediaUrl) }}
                        userAgent="Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1"
                        scrollEnabled={false}
                        allowsFullscreenVideo
                        javaScriptEnabled={true}
                        domStorageEnabled={true}
                        mixedContentMode="always"
                        style={{ flex: 1 }}
                        startInLoadingState={true}
                        renderLoading={() => (
                            <View style={{
                                position: 'absolute',
                                top: 0, left: 0, right: 0, bottom: 0,
                                justifyContent: 'center',
                                alignItems: 'center',
                                backgroundColor: '#000'
                            }}>
                                <ActivityIndicator color="#3b82f6" size="large" />
                                <Text className="text-white text-xs mt-3 font-bold animate-pulse">
                                    Fetching TikTok...
                                </Text>
                            </View>
                        )}
                    />
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
                    <Image
                        source={{ uri: post.mediaUrl }}
                        style={{ width: '100%', height: 300 }}
                        resizeMode="cover"
                    />
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
            <Pressable onPress={() => isFeed && router.push(`/post/${post.slug || post?._id}`)}>
                <Text className="text-2xl font-black text-gray-900 dark:text-white mb-2 leading-tight">
                    {post?.title}
                </Text>
                <View className="mb-1">{renderContent()}</View>
            </Pressable>

            {renderMediaContent()}

            {post.poll && <Poll poll={post.poll} postId={post?._id} deviceId={user?.deviceId} />}

            {/* Action Footer */}
            <View className="flex-row items-center justify-between border-t border-gray-50 dark:border-gray-800 pt-2 mt-2">
                <View className="flex-row items-center gap-2 space-x-6">
                    <Pressable onPress={handleLike} disabled={liked} className="flex-row items-center">
                        <Ionicons
                            name={liked ? "heart" : "heart-outline"}
                            size={22}
                            color={liked ? "#ef4444" : isDark ? "#fff" : "#1f2937"}
                        />
                        <Text className={`ml-1 font-bold ${liked ? "text-red-500" : "text-gray-600 dark:text-gray-400"}`}>{totalLikes}</Text>
                    </Pressable>

                    <View className="flex flex-row gap-1 items-center">
                        <Feather name="message-circle" size={18} color={isDark ? "#fff" : "#1f2937"} />
                        <Text key={totalComments}>{totalComments}</Text>
                    </View>
                </View>

                <Pressable onPress={handleNativeShare} className="p-2 bg-gray-50 dark:bg-gray-800 rounded-full">
                    <Feather name="share-2" size={18} color={isDark ? "#fff" : "#1f2937"} />
                </Pressable>
            </View>

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
