import { useEffect, useRef, useState } from "react"; // Added useRef
import { ActivityIndicator, DeviceEventEmitter, FlatList } from "react-native"; // Added DeviceEventEmitter
import PostCard from "./PostCard";
import { Text } from "./Text";

const LIMIT = 5;
const API_URL = "https://oreblogda.vercel.app/api/posts";

export default function PostsViewer() {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  
  // 1. Create the scroll reference
  const scrollRef = useRef(null);

  // 2. Listen for the "Scroll to Top" command from Layout
  useEffect(() => {
    const sub = DeviceEventEmitter.addListener("doScrollToTop", () => {
      scrollRef.current?.scrollToOffset({ offset: 0, animated: true });
    });
    return () => sub.remove();
  }, []);

  const fetchPosts = async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}?page=${page}&limit=${LIMIT}`);
      const data = await res.json();
      const newPosts = data.posts || [];

      setPosts((prev) => {
        const map = new Map([...prev, ...newPosts].map(p => [p._id, p]));
        return Array.from(map.values());
      });

      if (newPosts.length < LIMIT) setHasMore(false);
      setPage((prev) => prev + 1);
    } catch (e) {
      console.log("Fetch error", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <FlatList
      ref={scrollRef} // 3. Attach the ref here
      data={posts}
      keyExtractor={(item) => item._id}
      contentContainerStyle={{ padding: 16, paddingTop: 40, paddingBottom: 60 }} // Extra padding so TabBar doesn't hide last post
      renderItem={({ item }) => <PostCard post={item} isFeed />}
      onEndReached={fetchPosts}
      onEndReachedThreshold={0.4}
      
      // 4. Send scroll position to MainLayout
      onScroll={(e) => {
        const offsetY = e.nativeEvent.contentOffset.y;
        DeviceEventEmitter.emit("onScroll", offsetY);
      }}
      scrollEventThrottle={16} // This makes the scroll tracking smooth

      ListFooterComponent={
        loading ? (
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