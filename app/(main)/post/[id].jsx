import { useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, DeviceEventEmitter, ScrollView, View } from 'react-native';
import useSWR from 'swr';
// 1. Import AdMob components
import CommentSection from "../../../components/CommentSection";
import PostCard from "../../../components/PostCard";
import SimilarPosts from "../../../components/SimilarPosts";
import { Text } from '../../../components/Text';

const fetcher = (url) => fetch(url).then((res) => res.json());
const API_URL = "https://oreblogda.com"

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams();
  const [similarPosts, setSimilarPosts] = useState([]);
  
  const scrollRef = useRef(null);

  useEffect(() => {
    const sub = DeviceEventEmitter.addListener("doScrollToTop", () => {
      scrollRef.current?.scrollTo({ y: 0, animated: true });
    });
    return () => sub.remove();
  }, []);

  const { data: post, error, mutate, isLoading } = useSWR(
    `${API_URL}/api/posts/${id}`,
    fetcher,
    { revalidateOnFocus: false }
  );

  useEffect(() => {
    if (!post?._id) return;

    fetch(`${API_URL}/api/posts?category=${post.category}&limit=6`)
      .then(res => res.json())
      .then(data => {
        const filtered = (data.posts || []).filter((p) => p._id !== id);
        setSimilarPosts(filtered);
      });

    handleViewIncrement(post._id);
  }, [post?._id]);

  const handleViewIncrement = async (postId) => {
    try {
      await fetch(`${API_URL}/api/posts/${postId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "view" }),
      });
      mutate({ ...post, views: (post.views || 0) + 1 }, false);
    } catch (e) {
      console.error("View count update failed", e);
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-white dark:bg-[#0a0a0a]">
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (error || !post) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>Post not found</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white dark:bg-gray-900">
      <ScrollView 
        ref={scrollRef} 
        onScroll={(e) => {
          DeviceEventEmitter.emit("onScroll", e.nativeEvent.contentOffset.y);
        }}
        scrollEventThrottle={16}
        className="flex-1"
        contentContainerStyle={{ paddingTop: 40, paddingBottom: 20 }} 
      >
        <View className="p-4 relative">
          
          {/* Main Post Section */}
          <View className="mb-4">
            <PostCard
              post={post}
              isFeed={false}
              posts={[post]}
              setPosts={mutate}
              hideComments={true}
            />
          </View>

          {/* Comment Section */}
          <View className="mb-6">
            <CommentSection postId={post._id} mutatePost={mutate} />
          </View>

          {/* Similar Posts */}
          <View className="mb-10">
            <Text className="text-xl font-bold mb-4 dark:text-white">Similar Posts</Text>
            <SimilarPosts
              posts={similarPosts}
              category={post?.category}
              currentPostId={post?._id}
            />
          </View>
        </View>
        {/* 2. Banner Ad at the absolute bottom of the screen */}
      {/* <View className="items-center bg-gray-50 mb-14 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-1">
        <BannerAd
          unitId={TestIds.BANNER}
          size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
          onAdFailedToLoad={(error) => console.error("Ad failed:", error)}
        />
      </View> */}
      </ScrollView>
    </View>
  );
}