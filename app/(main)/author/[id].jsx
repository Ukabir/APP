import { useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, DeviceEventEmitter, FlatList, Image, Text, View } from "react-native";
import PostCard from "../../../components/PostCard";

const API_BASE = "https://oreblogda.vercel.app/api"

export default function AuthorPage() {
  const { id } = useLocalSearchParams()
  const [author, setAuthor] = useState(null)
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // 1. Ref and Event Listener for Scroll to Top
  const scrollRef = useRef(null);

  useEffect(() => {
    const sub = DeviceEventEmitter.addListener("doScrollToTop", () => {
      scrollRef.current?.scrollToOffset({ offset: 0, animated: true });
    });
    return () => sub.remove();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [userRes, postRes] = await Promise.all([
        fetch(`${API_BASE}/users/${id}`),
        fetch(`${API_BASE}/posts?author=${id}&page=1&limit=6`),
      ]);

      const userData = await userRes.json();
      const postData = await postRes.json();

      if (userRes.ok) setAuthor(userData.user);
      if (postRes.ok) {
        setPosts(postData.posts);
        setHasMore(postData.posts.length === 6);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMorePosts = async () => {
    if (!hasMore || loading || posts.length === 0) return;

    const nextPage = page + 1;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/posts?author=${id}&page=${nextPage}&limit=6`);
      const data = await res.json();

      if (res.ok && data.posts.length > 0) {
        setPosts((prev) => [...prev, ...data.posts]);
        setPage(nextPage);
        setHasMore(data.posts.length === 6);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Load more error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, [id]);

  // Header Component (Bio)
  const ListHeader = () => (
    <View className="p-4 pt-20 mb-4 border-b border-gray-100 dark:border-gray-800">
      {author && (
        <View className="flex-row items-center gap-4">
          <Image
            source={{ uri: author.profilePic?.url || "https://via.placeholder.com/150" }}
            className="w-20 h-20 rounded-full border border-gray-200"
          />
          <View className="flex-1">
            <Text className="text-2xl font-bold dark:text-white">{author.username}</Text>
            <Text className="text-gray-600 dark:text-gray-400 mt-1">
              {author.description || "This author hasn’t added a description yet."}
            </Text>
          </View>
        </View>
      )}
    </View>
  );

  // 2. Initial Full Screen Loader
  if (loading && posts.length === 0) {
    return (
      <View className="flex-1 justify-center items-center bg-white dark:bg-gray-900">
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <FlatList
      ref={scrollRef}
      data={posts}
      keyExtractor={(item) => item._id}
      renderItem={({ item }) => (
        <View className="px-4 mb-6">
          <PostCard post={item} isFeed />
        </View>
      )}
      ListHeaderComponent={ListHeader}
      
      // 3. Infinite Scroll Loader & Footer
      ListFooterComponent={
        <View className="py-6">
          {loading && <ActivityIndicator size="small" color="#3b82f6" />}
          {!hasMore && posts.length > 0 && (
            <Text className="text-center text-gray-500 mb-4">No more posts.</Text>
          )}
        </View>
      }

      onEndReached={fetchMorePosts}
      onEndReachedThreshold={0.5}
      
      onRefresh={() => {
        setPage(1);
        fetchInitialData();
      }}
      refreshing={refreshing}

      // 4. Send Scroll position to MainLayout for BackToTop visibility
      onScroll={(e) => {
        DeviceEventEmitter.emit("onScroll", e.nativeEvent.contentOffset.y);
      }}
      scrollEventThrottle={16}

      contentContainerStyle={{ paddingBottom: 120 }}
      className="bg-white dark:bg-gray-900"
    />
  );
}