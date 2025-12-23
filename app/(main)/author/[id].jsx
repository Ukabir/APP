import { useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, DeviceEventEmitter, FlatList, Image, View } from "react-native";
// 1. Import AdMob components
import PostCard from "../../../components/PostCard";
import { Text } from "../../../components/Text";

const API_BASE = "https://oreblogda.com/api"

export default function AuthorPage() {
  const { id } = useLocalSearchParams()
  const [author, setAuthor] = useState(null)
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

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

  // --- 💡 List Header Ad ---
  const ListHeader = () => (
    <View className="mb-4">
      <View className="p-4 pt-20 border-b border-gray-100 dark:border-gray-800">
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

      {/* Large Banner Ad under Description */}
      {/* <View className="items-center py-4 bg-gray-50/50 dark:bg-gray-800/20 mt-2">
        <Text className="text-[10px] text-gray-400 mb-2 uppercase tracking-tighter">Advertisement</Text>
        <BannerAd
          unitId={TestIds.BANNER}
          size={BannerAdSize.LARGE_BANNER}
          onAdFailedToLoad={(error) => console.error(error)}
        />
      </View> */}
    </View>
  );

  // --- 💡 Every 3 Posts Ad Logic ---
  const renderItem = ({ item, index }) => {
    const showAd = (index + 1) % 3 === 0;

    return (
      <View className="px-4">
        <PostCard post={item} isFeed />
        
        {/* {showAd && (
          <View className="my-6 items-center bg-gray-50 dark:bg-gray-800/30 py-4 rounded-2xl border border-gray-100 dark:border-gray-800">
            <Text className="text-[10px] text-gray-400 mb-2 uppercase">Sponsored</Text>
            <BannerAd
              unitId={TestIds.BANNER}
              size={BannerAdSize.LARGE_BANNER}
              onAdFailedToLoad={(error) => console.error(error)}
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
      </View>
    );
  }

  return (
    <FlatList
      ref={scrollRef}
      data={posts}
      keyExtractor={(item) => item._id}
      renderItem={renderItem}
      ListHeaderComponent={ListHeader}
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
      onScroll={(e) => {
        DeviceEventEmitter.emit("onScroll", e.nativeEvent.contentOffset.y);
      }}
      scrollEventThrottle={16}
      contentContainerStyle={{ paddingBottom: 120 }}
      className="bg-white dark:bg-gray-900"
    />
  );
}