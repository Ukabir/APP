import { useEffect, useRef } from "react";
import {
  ActivityIndicator,
  DeviceEventEmitter,
  FlatList,
} from "react-native";
import useSWRInfinite from "swr/infinite";
import PostCard from "./PostCard";
import { Text } from "./Text";

const LIMIT = 5;
const API_URL = "https://oreblogda.vercel.app/api/posts";

const fetcher = (url) => fetch(url).then(res => res.json());

export default function PostsViewer() {
  const scrollRef = useRef(null);

  // ----------------------------
  // SWR Infinite Key Generator
  // ----------------------------
  const getKey = (pageIndex, previousPageData) => {
    // stop if no more posts
    if (previousPageData && previousPageData.posts?.length < LIMIT) {
      return null;
    }
    return `${API_URL}?page=${pageIndex + 1}&limit=${LIMIT}`;
  };

  const {
    data,
    size,
    setSize,
    isLoading,
    isValidating,
  } = useSWRInfinite(getKey, fetcher, {
    refreshInterval: 10000,       // ✅ polling (10s)
    revalidateOnFocus: true,
    dedupingInterval: 5000,
  });

  // ----------------------------
  // Flatten & dedupe posts
  // ----------------------------
  const posts = data
    ? Array.from(
        new Map(
          data
            .flatMap(page => page.posts || [])
            .map(p => [p._id, p])
        ).values()
      )
    : [];

  const hasMore =
    data?.[data.length - 1]?.posts?.length === LIMIT;

  // ----------------------------
  // Scroll-to-top listener
  // ----------------------------
  useEffect(() => {
    const sub = DeviceEventEmitter.addListener("doScrollToTop", () => {
      scrollRef.current?.scrollToOffset({ offset: 0, animated: true });
    });
    return () => sub.remove();
  }, []);

  // ----------------------------
  // Load more (pagination)
  // ----------------------------
  const loadMore = () => {
    if (!hasMore || isValidating) return;
    setSize(size + 1);
  };

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
      renderItem={({ item }) => <PostCard post={item} isFeed />}

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
          <Text className="text-center text-gray-400 my-4">
            No more posts
          </Text>
        ) : null
      }
    />
  );
}
