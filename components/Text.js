import { Text as RNText } from "react-native";

export function Text({ className = "", children, style, ...props }) {
  // 1. Check if the user is passing a specific color or size
  const hasColor = className.includes("text-black") || className.includes("text-white") || className.includes("text-blue");
  
  // 2. Only apply default gray if NO other color is provided
  const defaultColors = hasColor ? "" : "text-gray-600 dark:text-gray-100";

  return (
    <RNText
      style={[
        { 
          includeFontPadding: false, // Kills the top gap
        }, 
        style
      ]}
      // We use a template literal to ensure classes are clean
      className={`font-space ${defaultColors} ${className}`}
      {...props}
    >
      {children}
    </RNText>
  );
}