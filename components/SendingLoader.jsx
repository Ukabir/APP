import { Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';
import { Animated, Easing, View } from 'react-native';

const SendingLoader = () => {
  const spinValue = new Animated.Value(0);

  useEffect(() => {
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View className="flex-row items-center justify-center p-2">
      <Animated.View style={{ transform: [{ rotate: spin }] }}>
        <Ionicons name="refresh-outline" size={20} color="#3b82f6" />
      </Animated.View>
      <Text className="ml-2 text-blue-500 font-bold">Sending...</Text>
    </View>
  );
};
// export default function SendingLoader() {
//   return null;
// }

// Use this inside your CommentSection's Post button
// {isPosting ? <SendingLoader /> : <Text className="text-white">Post</Text>}