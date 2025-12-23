import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  DeviceEventEmitter,
  FlatList,
  InteractionManager,
  View,
} from "react-native";
import useSWRInfinite from "swr/infinite";
import PostCard from "./PostCard";
import { Text } from "./Text";

const LIMIT = 5;
const API_URL = "https://oreblogda.com/api/posts";

const fetcher = (url) => fetch(url).then(res => res.json());

export default function PostsViewer() {
  const scrollRef = useRef(null);
  const [ready, setReady] = useState(false); // New state to delay rendering

  // Delay SWR and Ads until the navigation animation is finished
  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(() => {
      setReady(true);
    });
    return () => task.cancel();
  }, []);

  const getKey = (pageIndex, previousPageData) => {
    if (!ready) return null; // Don't fetch until ready
    if (previousPageData && previousPageData.posts?.length < LIMIT) return null;
    return `${API_URL}?page=${pageIndex + 1}&limit=${LIMIT}`;
  };

  const { data, size, setSize, isLoading, isValidating, mutate } = useSWRInfinite(getKey, fetcher, {
    refreshInterval: 10000,
    revalidateOnFocus: true,
    dedupingInterval: 5000,
  });

  const posts = data
    ? Array.from(
        new Map(
          data.flatMap(page => page.posts || []).map(p => [p._id, p])
        ).values()
      )
    : [];

  const hasMore = data?.[data.length - 1]?.posts?.length === LIMIT;

  useEffect(() => {
    const sub = DeviceEventEmitter.addListener("doScrollToTop", () => {
      scrollRef.current?.scrollToOffset({ offset: 0, animated: true });
    });
    return () => sub.remove();
  }, []);

  const loadMore = () => {
    if (!hasMore || isValidating || !ready) return;
    setSize(size + 1);
  };

  const renderItem = ({ item, index }) => {
    const showAd = (index + 1) % 4 === 0;

    return (
      <View>
        <PostCard post={item} isFeed posts={posts} setPosts={mutate} />
        
        {/* Only load ads once the screen transition is finished */}
        {/* {showAd && ready && (
          <View className="my-4 items-center bg-gray-50 dark:bg-gray-800/50 py-3 rounded-xl border border-gray-100 dark:border-gray-800">
            <Text className="text-[10px] text-gray-400 mb-2 uppercase tracking-widest">Sponsored</Text>
            <BannerAd
              unitId={TestIds.BANNER}
              size={BannerAdSize.MEDIUM_RECTANGLE}
              onAdFailedToLoad={(error) => console.error("Banner Error:", error)}
            />
          </View>
        )} */}
      </View>
    );
  };

  // Show a simple loader while the transition finishes to keep things light
  if (!ready) {
    return (
      <View className="flex-1 justify-center items-center py-10">
        <ActivityIndicator size="small" color="#3b82f6" />
      </View>
    );
  }

  return (
    <FlatList
      ref={scrollRef}
      data={posts}
      keyExtractor={(item) => item._id}
      contentContainerStyle={{
        padding: 16,
        paddingTop: 40,
        paddingBottom: 60,
      }}
      renderItem={renderItem}
      onEndReached={loadMore}
      onEndReachedThreshold={0.4}
      onScroll={(e) => {
        const offsetY = e.nativeEvent.contentOffset.y;
        DeviceEventEmitter.emit("onScroll", offsetY);
      }}
      scrollEventThrottle={16}
      ListFooterComponent={
        isLoading || isValidating ? (
          <ActivityIndicator size="small" color="#3b82f6" className="my-4" />
        ) : !hasMore ? (
          <Text className="text-center text-gray-400 my-4">No more posts</Text>
        ) : null
      }
    />
  );
}