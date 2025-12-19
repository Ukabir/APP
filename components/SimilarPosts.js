import React, { useEffect, useState } from "react";
import { ScrollView, View } from "react-native";
import useSWR from "swr";
import PostCard from "./PostCard";

// Replace with your actual base API URL
const API_URL = "https://oreblogda.vercel.app";
const fetcher = (url) => fetch(url).then((res) => res.json());

export default function SimilarPosts({ category, currentPostId }) {
  const [shuffledPosts, setShuffledPosts] = useState([]);

  const { data, error, isLoading } = useSWR(
    category ? `${API_URL}/api/posts?category=${category}` : null,
    fetcher,
    { refreshInterval: 10000 }
  );

  useEffect(() => {
    if (data) {
      const list = (Array.isArray(data) ? data : data.posts || [])
        .filter((p) => p._id !== currentPostId);

      // Shuffle and pick 6
      const shuffled = [...list].sort(() => Math.random() - 0.5);
      setShuffledPosts(shuffled.slice(0, 6));
    }
  }, [data, currentPostId]);

  if (isLoading || error || !shuffledPosts.length) return null;

  return (
    <View className="mt-6">
      {/* Horizontal ScrollView replaces the overflow-x-auto div */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingVertical: 8 }}
        className="flex-row"
      >
        {shuffledPosts.map((post, index) => {
          return (
            <React.Fragment key={post._id}>
              {/* Post Item */}
              <View className="mr-4 w-72">
                <PostCard
                  post={post}
                  posts={shuffledPosts}
                  setPosts={() => {}}
                  isFeed={true}
                  // We handle specific mobile heights here
                  className="h-[400px] flex flex-col justify-between"
                  hideMedia={post.category === "Polls"}
                />
              </View>

              {/* Ad placement every 2 posts */}
              {(index + 1) % 2 === 0 && (
                <View className="mr-4 justify-center">
                   {/* <SimilarPostAd /> */}
                   {/* Placeholder for ad UI */}
                </View>
              )}
            </React.Fragment>
          );
        })}
      </ScrollView>
    </View>
  );
}