import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, View } from "react-native";

interface StarRatingProps {
  rating: number;
  size?: number;
  showEmpty?: boolean;
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  size = 14,
  showEmpty = true,
}) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  const emptyStars = showEmpty ? 5 - Math.ceil(rating) : 0;

  return (
    <View style={styles.container}>
      {Array.from({ length: fullStars }).map((_, i) => (
        <Ionicons key={i} name="star" size={size} color="#FFB800" />
      ))}
      {hasHalfStar && (
        <Ionicons key="half" name="star-half" size={size} color="#FFB800" />
      )}
      {showEmpty &&
        Array.from({ length: emptyStars }).map((_, i) => (
          <Ionicons
            key={`empty-${i}`}
            name="star-outline"
            size={size}
            color="#D1D5DB"
          />
        ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 2,
  },
});
