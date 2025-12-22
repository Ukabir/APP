import { useEffect, useState } from "react";
import { Pressable, View } from "react-native";
import Toast from "react-native-toast-message";
import useSWR from "swr";
import { useUser } from "../context/UserContext";
import { Text } from "./Text";

const API_URL = "https://oreblogda.vercel.app";

const fetcher = (url) => fetch(url).then(res => res.json());
export default function Poll({ poll, postId, readOnly = false }) {
    const { user } = useUser();
    const [selectedOptions, setSelectedOptions] = useState([]);
    const [submitted, setSubmitted] = useState(false);

    // --- SWR: live post (poll source of truth) ---
    const { data, mutate } = useSWR(
        postId ? `${API_URL}/api/posts/${postId}` : null,
        fetcher,
        {
            refreshInterval: 5000,          // keep poll in sync across devices
            revalidateOnFocus: true,
            dedupingInterval: 0,            // ⚠️ prevent stale cache rollback
        }
    );

    const livePoll = data?.poll || poll;

    // --- Detect if this device already voted ---
    useEffect(() => {
        if (user?.deviceId && livePoll?.voters?.includes(user.deviceId)) {
            setSubmitted(true);
        }
    }, [livePoll?.voters, user?.deviceId]);

    const handleOptionChange = (optionIndex) => {
        if (readOnly || submitted) return;

        if (livePoll.pollMultiple) {
            setSelectedOptions((prev) =>
                prev.includes(optionIndex)
                    ? prev.filter((i) => i !== optionIndex)
                    : [...prev, optionIndex]
            );
        } else {
            setSelectedOptions([optionIndex]);
        }
    };

    const handleVote = async () => {
        if (readOnly || selectedOptions.length === 0 || !user?.deviceId) {
            if (!user?.deviceId) {
                Toast.show({ type: "error", text1: "Device ID not found" });
            }
            return;
        }

        // --- Optimistic UI update ---
        const optimisticPoll = {
            ...livePoll,
            options: livePoll.options.map((opt, i) =>
                selectedOptions.includes(i)
                    ? { ...opt, votes: opt.votes + 1 }
                    : opt
            ),
            voters: [...(livePoll.voters || []), user.deviceId],
        };

        // Apply optimistic update instantly
        mutate(
            (current) => ({ ...current, poll: optimisticPoll }),
            false
        );

        setSubmitted(true);
        Toast.show({ type: "success", text1: "Vote submitted!" });

        try {
            const res = await fetch(`${API_URL}/api/posts/${postId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "vote",
                    fingerprint: user.deviceId,
                    payload: { selectedOptions },
                }),
            });

            const result = await res.json();

            if (!res.ok) {
                if (result.message === "Already voted") {
                    Toast.show({ type: "info", text1: "You’ve already voted!" });
                } else {
                    throw new Error(result.message || "Vote failed");
                }
            }

            // Revalidate with backend truth
            mutate();

        } catch (err) {
            Toast.show({ type: "error", text1: "Vote failed, retrying…" });
            mutate(); // rollback to backend state if needed
        }
    };

    const totalVotes = livePoll.options.reduce((sum, opt) => sum + opt.votes, 0);

    return (
        <View className="mt-4 p-3 border border-gray-200 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700">
            <Text className="font-semibold mb-3 text-lg">Poll</Text>

            <View className="flex-row flex-wrap justify-between">
                {livePoll.options.map((opt, i) => {
                    const percentage = totalVotes
                        ? ((opt.votes / totalVotes) * 100).toFixed(1)
                        : 0;

                    return (
                        <View key={i} className="mb-3 w-[48%]">
                            <View className="flex-row items-center">
                                {!readOnly && !submitted && (
                                    <Pressable
                                        onPress={() => handleOptionChange(i)}
                                        className={`w-4 h-4 mr-2 border border-gray-400 items-center justify-center ${
                                            livePoll.pollMultiple ? "rounded-sm" : "rounded-full"
                                        }`}
                                    >
                                        {selectedOptions.includes(i) && (
                                            <View
                                                className={`w-2 h-2 bg-blue-500 ${
                                                    livePoll.pollMultiple
                                                        ? "rounded-[1px]"
                                                        : "rounded-full"
                                                }`}
                                            />
                                        )}
                                    </Pressable>
                                )}

                                <Text
                                    className="text-sm flex-1 text-gray-600 dark:text-gray-400"
                                    numberOfLines={1}
                                >
                                    {opt.text}
                                </Text>
                                <Text className="ml-1 text-gray-600 dark:text-gray-400 text-sm">
                                    ({opt.votes})
                                </Text>
                            </View>

                            <View className="w-full bg-gray-300 dark:bg-gray-600 h-2 rounded mt-1 overflow-hidden">
                                <View
                                    className="bg-blue-500 h-2 rounded"
                                    style={{ width: `${percentage}%` }}
                                />
                            </View>

                            <Text className="text-[10px] text-gray-600 dark:text-gray-400 mt-1">
                                {percentage}% of votes
                            </Text>
                        </View>
                    );
                })}
            </View>

            {!readOnly && !submitted && (
                <Pressable
                    onPress={handleVote}
                    className="px-3 py-2 mt-3 bg-blue-500 rounded active:bg-blue-600"
                >
                    <Text className="text-white text-center font-medium">
                        Submit Vote
                    </Text>
                </Pressable>
            )}

            {submitted && (
                <Text className="text-sm text-green-600 mt-2 font-medium">
                    ✅ You’ve voted
                </Text>
            )}
        </View>
    );
}
