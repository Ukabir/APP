import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator, Alert, FlatList,
    Image, Platform, Pressable, Text, TextInput,
    TouchableOpacity, View
} from "react-native";
import { useUser } from "../../context/UserContext";

const API_BASE = "https://oreblogda.vercel.app/api";

export default function MobileProfilePage() {
    const { user, setUser } = useUser();
    const router = useRouter()
    // States
    const [description, setDescription] = useState("");
    const [preview, setPreview] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingPosts, setLoadingPosts] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const limit = 5;

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
                    setDescription(dbUser.description || "");
                }
            } catch (err) {
                console.error("Sync User Error:", err);
            }
        };
        syncUserWithDB();
    }, [user?.deviceId]);

    // 🔹 2. Fetch Posts (Only triggers once we have the real user._id)
    useEffect(() => {
        if (user?._id) {
            fetchUserPosts(page);
        }
    }, [user?._id, page]);

    const fetchUserPosts = async (pageNum) => {
        if (!user?._id) return;
        try {
            setLoadingPosts(true);
            const res = await fetch(`${API_BASE}/posts?author=${user._id}&page=${pageNum}&limit=${limit}`);
            const data = await res.json();
            const newPosts = data.posts || [];

            if (newPosts.length < limit) setHasMore(false);
            setPosts(prev => pageNum === 1 ? newPosts : [...prev, ...newPosts]);
        } catch (err) {
            console.error("Fetch Posts Error:", err);
        } finally {
            setLoadingPosts(false);
        }
    };

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        });

        if (!result.canceled) {
            const selected = result.assets[0];
            setPreview(selected.uri);
            setImageFile({
                uri: selected.uri,
                name: "profile.jpg",
                type: "image/jpeg",
            });
        }
    };

    const handleUpdate = async () => {
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("userId", user?._id || "");
            formData.append("fingerprint", user?.deviceId || "");
            formData.append("description", description);

            if (imageFile) {
                if (Platform.OS === 'web') {
                    // 🌐 WEB FIX: Fetch the local URI and turn it into a Blob
                    const response = await fetch(imageFile.uri);
                    const blob = await response.blob();
                    formData.append("file", blob, "profile.jpg");
                } else {
                    // 📱 MOBILE: Use the standard object
                    formData.append("file", imageFile);
                }
            }

            const res = await fetch(`${API_BASE}/users/upload`, {
                method: "PUT",
                body: formData,
            });

            const result = await res.json();
            if (res.ok) {
                Alert.alert("Success", "Profile updated successfully!");
                setUser(result.user);
                setPreview(null);
                setImageFile(null);
            } else {
                Alert.alert("Update Failed", result.message);
            }
        } catch (err) {
            Alert.alert("Error", "Failed to connect to server.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (postId) => {
        Alert.alert("Confirm", "Delete this post?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete",
                style: "destructive",
                onPress: async () => {
                    try {
                        const res = await fetch(`${API_BASE}/posts/delete`, {
                            method: "DELETE",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ postId, fingerprint: user?.deviceId }),
                        });
                        if (res.ok) {
                            setPosts(prev => prev.filter(p => p._id !== postId));
                        }
                    } catch (err) {
                        Alert.alert("Error", "Error deleting post");
                    }
                }
            }
        ]);
    };

    // 🔹 Memoized Header to prevent focus-loss on TextInput
    const listHeader = useMemo(() => (
        <View className="px-6">
            <Text style={{ marginTop: 0 }} className="text-2xl font-semibold dark:text-white">Edit Profile</Text>

            <View className="items-center justify-center my-8">
                <TouchableOpacity onPress={pickImage} className="relative">
                    <Image
                        source={{
                            uri: preview
                                ? preview
                                : (user?.profilePic?.url)
                                    ? user.profilePic.url
                                    : "https://via.placeholder.com/150"
                        }}
                        style={{ width: 112, height: 112, borderRadius: 56 }}
                        className="border-2 border-blue-600 bg-gray-200"
                        resizeMode="cover"
                    />
                    <View className="absolute bottom-0 right-0 bg-blue-600 p-2 rounded-full border-2 border-white dark:border-gray-900">
                        <Ionicons name="camera" size={20} color="white" />
                    </View>
                </TouchableOpacity>
            </View>

            <View className="mb-10">
                <View className="mb-5">
                    <Text className="mb-1 text-sm font-medium text-gray-600 dark:text-gray-400">Name</Text>
                    <TextInput
                        value={user?.username || "Guest Author"}
                        editable={false}
                        style={{ outlineStyle: 'none' }}
                        className="border border-gray-300 rounded-lg w-full p-3 bg-gray-200 text-black"
                    />
                </View>

                <View className="mb-5">
                    <Text className="mb-1 text-sm font-medium text-gray-600 dark:text-gray-400">Description</Text>
                    <TextInput
                        multiline
                        value={description}
                        selectionColor="#2563eb"
                        underlineColorAndroid="transparent"
                        onChangeText={(text) => setDescription(text)}
                        placeholder="Write something about yourself..."
                        className="border border-gray-300 rounded-lg w-full p-3 h-28 text-black bg-white"
                        style={{ textAlignVertical: 'top', outlineStyle: 'none' }}
                    />
                </View>

                <TouchableOpacity
                    onPress={handleUpdate}
                    disabled={loading}
                    className="bg-blue-600 p-4 rounded-lg w-full items-center mt-2"
                >
                    {loading ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-lg">Save Changes</Text>}
                </TouchableOpacity>
            </View>

            <Text className="text-xl font-semibold mb-4 dark:text-white">Your Posts</Text>
        </View>
    ), [user, preview, description, loading]);

    return (
        <FlatList
            data={posts}
            keyExtractor={(item) => item._id}
            ListHeaderComponent={listHeader}
            className="bg-white dark:bg-gray-900"
            onEndReached={() => hasMore && !loadingPosts && setPage(p => p + 1)}
            onEndReachedThreshold={0.5}
            renderItem={({ item }) => (
                <View className="px-6 pb-20">
                    <View className="mx-6 border border-gray-200 p-4 max-w-[80%] rounded-xl flex-row justify-between items-center mb-4 bg-gray-50 dark:bg-gray-900">

                        {/* CLICKABLE CONTENT */}
                        <Pressable
                            onPress={() => router.push(`/post/${item.slug || item._id}`)}
                            className="flex-1 mr-4"
                        >
                            <Text
                                className="font-medium text-lg dark:text-white"
                                numberOfLines={1}
                            >
                                {item.title || item.message}
                            </Text>

                            <Text className="text-gray-500 text-xs mt-1">
                                {new Date(item.createdAt).toLocaleDateString()}
                            </Text>

                            {/* MINI ANALYTICS */}
                            <View className="flex-row items-center gap-4 mt-2">
                                {/* Likes */}
                                <View className="flex-row items-center gap-1">
                                    <Ionicons name="heart-outline" size={14} color="#9ca3af" />
                                    <Text className="text-gray-500 text-xs">
                                        {item.likes?.length || 0}
                                    </Text>
                                </View>

                                {/* Comments */}
                                <View className="flex-row items-center gap-1">
                                    <Ionicons name="chatbubble-outline" size={14} color="#9ca3af" />
                                    <Text className="text-gray-500 text-xs">
                                        {item.comments?.length || 0}
                                    </Text>
                                </View>

                                {/* Views */}
                                <View className="flex-row items-center gap-1">
                                    <Ionicons name="eye-outline" size={14} color="#9ca3af" />
                                    <Text className="text-gray-500 text-xs">
                                        {item.views || 0}
                                    </Text>
                                </View>
                            </View>

                        </Pressable>

                        {/* DELETE */}
                        <TouchableOpacity onPress={() => handleDelete(item._id)}>
                            <Text className="text-red-500 font-bold">Delete</Text>
                        </TouchableOpacity>

                    </View>
                </View>



            )}
            ListEmptyComponent={() => !loadingPosts && (
                <Text className="text-center text-gray-400 py-10">You haven't posted yet.</Text>
            )}
            ListFooterComponent={() => loadingPosts && <ActivityIndicator className="py-4" />}
        />
    );
}