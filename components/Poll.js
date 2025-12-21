import { useEffect, useState } from "react";
import { Pressable, View } from "react-native";
import Toast from "react-native-toast-message";
import { useUser } from "../context/UserContext"; // Import your context hook
import { Text } from "./Text";

export default function Poll({ poll, postId, setPosts, readOnly = false }) {
    const { user } = useUser(); // Get the user (and deviceId) from context
    const [selectedOptions, setSelectedOptions] = useState([]);
    const [submitted, setSubmitted] = useState(false);

    // Check if this deviceId has already voted
    useEffect(() => {
        if (user?.deviceId && poll.voters?.includes(user.deviceId)) {
            setSubmitted(true);
        }
    }, [poll.voters, user?.deviceId]);

    const handleOptionChange = (optionIndex) => {
        if (readOnly || submitted) return;

        if (poll.pollMultiple) {
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
            if (!user?.deviceId) Toast.show({ type: "error", text1: "Device ID not found" });
            return;
        }

        try {
            const res = await fetch(`https://oreblogda.vercel.app/api/posts/${postId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "vote",
                    fingerprint: user.deviceId, // must match backend
                    payload: { selectedOptions },
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                if (data.message === "Already voted") {
                    Toast.show({ type: "info", text1: "You’ve already voted!" });
                    setSubmitted(true);
                } else {
                    Toast.show({ type: "error", text1: data.message || "Vote failed" });
                }
                return;
            }

            // Update local post state with backend response
            if (setPosts && data.post) {
                setPosts((prev) =>
                    Array.isArray(prev)
                        ? prev.map((p) => (p._id === postId ? data.post : p))
                        : data.post
                );
            }

            setSubmitted(true);
            Toast.show({ type: "success", text1: "Vote submitted!" });

        } catch (err) {
            console.error("Vote error:", err);
            Toast.show({ type: "error", text1: "Failed to connect to server" });
        }
    };


    const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes, 0);

    return (
        <View className="mt-4 p-3 border border-gray-200 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700">
            <Text className="font-semibold mb-3 text-lg">Poll</Text>

            <View className="flex-row flex-wrap justify-between">
                {poll.options.map((opt, i) => {
                    const percentage = totalVotes ? ((opt.votes / totalVotes) * 100).toFixed(1) : 0;

                    return (
                        <View key={i} className="mb-3 w-[48%]">
                            <View className="flex-row items-center">
                                {!readOnly && !submitted && (
                                    <Pressable
                                        onPress={() => handleOptionChange(i)}
                                        className={`w-4 h-4 mr-2 border border-gray-400 items-center justify-center ${poll.pollMultiple ? "rounded-sm" : "rounded-full"}`}
                                    >
                                        {selectedOptions.includes(i) && (
                                            <View className={`w-2 h-2 bg-blue-500 ${poll.pollMultiple ? "rounded-[1px]" : "rounded-full"}`} />
                                        )}
                                    </Pressable>
                                )}

                                <Text className="text-sm flex-1 text-gray-600 dark:text-gray-400" numberOfLines={1}>{opt.text}</Text>
                                <Text className="ml-1 text-gray-600 dark:text-gray-400 text-sm">({opt.votes})</Text>
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
                    <Text className="text-white text-center font-medium">Submit Vote</Text>
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