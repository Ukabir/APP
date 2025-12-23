import { useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  DeviceEventEmitter,
  FlatList,
  View
} from "react-native";
// 1. Import AdMob components
import PostCard from "../../../components/PostCard";
import { Text } from "../../../components/Text";

const API_BASE = "https://oreblogda.com/api";
const LIMIT = 5;

export default function CategoryPage() {
  const { id } = useLocalSearchParams();
  
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

  useEffect(() => {
    const sub = DeviceEventEmitter.addListener("doScrollToTop", () => {
      scrollRef.current?.scrollToOffset({ offset: 0, animated: true });
    });
    return () => sub.remove();
  }, []);

  const fetchPosts = async (pageNum = 1, isRefresh = false) => {
    if (loading || (!hasMore && !isRefresh)) return;

    setLoading(true);
    try {
      const res = await fetch(
        `${API_BASE}/posts?category=${categoryName}&page=${pageNum}&limit=${LIMIT}`
      );
      const data = await res.json();
      const newPosts = data.posts || [];

      setPosts((prev) => {
        if (isRefresh) return newPosts;
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

  // --- 💡 Render Item with Ad Logic ---
  const renderItem = ({ item, index }) => {
    const showAd = (index + 1) % 4 === 0;

    return (
      <View className="px-4">
        <PostCard post={item} isFeed />
        
        {/* {showAd && (
          <View className="my-6 items-center bg-gray-50 dark:bg-gray-800/30 py-4 rounded-2xl border border-gray-100 dark:border-gray-800">
            <Text className="text-[10px] text-gray-400 mb-2 uppercase tracking-widest">Sponsored</Text>
            <BannerAd
              unitId={TestIds.BANNER}
              size={BannerAdSize.MEDIUM_RECTANGLE} // 320x100: Noticeable but not too tall
              onAdFailedToLoad={(error) => console.error("Ad error:", error)}
            />
          </View>
        )} */}
      </View>
    );
  };

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
        renderItem={renderItem} // Using the new helper
        
        ListHeaderComponent={() => (
          <View className="px-4 py-2 mb-4">
            <Text className="text-3xl font-extrabold text-gray-900 dark:text-white capitalize">
              {categoryName}
            </Text>
            <View className="h-1 w-12 bg-blue-600 mt-2 rounded-full" />
          </View>
        )}

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

        onEndReached={() => fetchPosts(page)}
        onEndReachedThreshold={0.5}
        onRefresh={() => fetchPosts(1, true)}
        refreshing={loading && posts.length > 0}
        onScroll={(e) => {
          DeviceEventEmitter.emit("onScroll", e.nativeEvent.contentOffset.y);
        }}
        scrollEventThrottle={16}
        contentContainerStyle={{ 
            paddingTop: 40, 
            paddingBottom: 60 
        }}
      />
    </View>
  );
}