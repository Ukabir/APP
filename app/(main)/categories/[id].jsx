import { useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  DeviceEventEmitter,
  FlatList,
  View
} from "react-native";
import PostCard from "../../../components/PostCard";
import { Text } from "../../../components/Text";

const API_BASE = "https://oreblogda.vercel.app/api";
const LIMIT = 5;

export default function CategoryPage() {
  const { id } = useLocalSearchParams()
  
  // 1. Format Category Name (Logic from your server component)
  const categoryName = id
    ? id.includes("-")
      ? id.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join("/")
      : id.charAt(0).toUpperCase() + id.slice(1).toLowerCase()
    : "";

  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const scrollRef = useRef(null);

  // 2. Scroll to Top Listener
  useEffect(() => {
    const sub = DeviceEventEmitter.addListener("doScrollToTop", () => {
      scrollRef.current?.scrollToOffset({ offset: 0, animated: true });
    });
    return () => sub.remove();
  }, []);

  // 3. Data Fetching
  const fetchPosts = async (pageNum = 1, isRefresh = false) => {
    if (loading || (!hasMore && !isRefresh)) return;

    setLoading(true);
    try {
      const res = await fetch(
        `${API_BASE}/posts?category=${categoryName}&page=${pageNum}&limit=${LIMIT}`
      );
      const data = await res.json();
      const newPosts = data.posts || []

      setPosts((prev) => {
        if (isRefresh) return newPosts
        // Deduplicate using Map
        const map = new Map([...prev, ...newPosts].map(p => [p._id, p]));
        return Array.from(map.values());
      });

      setHasMore(newPosts.length === LIMIT);
      setPage(pageNum + 1);
    } catch (e) {
      console.error("Category Fetch Error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts(1, true);
  }, [id]);

  // 4. Initial Large Loading Animation
  if (loading && posts.length === 0) {
    return (
      <View className="flex-1 justify-center items-center bg-white dark:bg-gray-900">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="mt-4 text-gray-500 dark:text-gray-400">Loading {categoryName}...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white dark:bg-gray-900">
      <FlatList
        ref={scrollRef}
        data={posts}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View className="px-4 mb-0">
            <PostCard post={item} isFeed />
          </View>
        )}
        
        // Header showing Category Title
        ListHeaderComponent={() => (
          <View className="px-4 py-2">
            <Text className="text-3xl font-extrabold text-gray-900 dark:text-white capitalize">
              {categoryName}
            </Text>
            <View className="h-1 w-12 bg-blue-600 mt-2 rounded-full" />
          </View>
        )}

        // Footer with Load More Animation & Main Footer
        ListFooterComponent={() => (
          <View className="py-8">
            {loading && <ActivityIndicator size="small" color="#3b82f6" />}
            {!hasMore && posts.length > 0 && (
              <Text className="text-center text-gray-500 dark:text-gray-400 mb-6">
                End of {categoryName}
              </Text>
            )}
          </View>
        )}

        // Infinite Scroll
        onEndReached={() => fetchPosts(page)}
        onEndReachedThreshold={0.5}

        // Pull to Refresh
        onRefresh={() => fetchPosts(1, true)}
        refreshing={loading && posts.length > 0}

        // Scroll Tracking for Layout (BackToTop & Nav visibility)
        onScroll={(e) => {
          DeviceEventEmitter.emit("onScroll", e.nativeEvent.contentOffset.y);
        }}
        scrollEventThrottle={16}

        contentContainerStyle={{ 
            paddingTop: 40, // Space for TopBar + CategoryNav
            paddingBottom: 60 
        }}
      />
    </View>
  );
}