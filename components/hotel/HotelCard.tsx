import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
} from "react-native";
import { Hotel } from "../../types/hotel";
import { StarRating } from "../ui/StarRating";
import { FavoriteButton } from "../ui/FavoriteButton";
import { Colors } from "../../constants/colors";
import { Spacing, Sizes } from "../../constants/spacing";
import { Typography } from "../../constants/typography";

const { width } = Dimensions.get("window");

interface HotelCardProps {
  hotel: Hotel;
  isFavorite: boolean;
  onToggleFavorite: (hotel: Hotel) => void;
  variant?: "horizontal" | "vertical";
}

export const HotelCard: React.FC<HotelCardProps> = ({
  hotel,
  isFavorite,
  onToggleFavorite,
  variant = "vertical",
}) => {
  const router = useRouter();

  const handlePress = () => {
    router.push({
      pathname: "/hotel-detail",
      params: { hotelId: hotel.id.toString() },
    } as any);
  };

  if (variant === "horizontal") {
    return (
      <TouchableOpacity
        style={styles.horizontalCard}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <View style={styles.horizontalImageContainer}>
          <Image source={hotel.image} style={styles.horizontalImage} />
          <FavoriteButton
            isFavorite={isFavorite}
            onPress={() => onToggleFavorite(hotel)}
            style={styles.favoriteButtonSmall}
          />
        </View>
        <View style={styles.horizontalInfo}>
          <View style={styles.ratingContainer}>
            <StarRating rating={hotel.rating} size={14} />
            <Text style={styles.ratingText}>
              {hotel.rating.toFixed(1)} ({hotel.reviews} Reviews)
            </Text>
          </View>
          <Text style={styles.hotelName}>{hotel.name}</Text>
          <View style={styles.locationContainer}>
            <Ionicons
              name="location-outline"
              size={14}
              color={Colors.textSecondary}
            />
            <Text style={styles.locationText}>{hotel.location}</Text>
          </View>
          <Text style={styles.priceText}>${hotel.price}/night</Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={styles.verticalCard}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <View style={styles.verticalImageContainer}>
        <Image source={hotel.image} style={styles.verticalImage} />
        <FavoriteButton
          isFavorite={isFavorite}
          onPress={() => onToggleFavorite(hotel)}
          style={styles.favoriteButton}
        />
      </View>
      <View style={styles.verticalInfo}>
        <View style={styles.ratingContainer}>
          <StarRating rating={hotel.rating} size={14} />
          <Text style={styles.ratingText}>
            {hotel.rating.toFixed(1)} ({hotel.reviews} Reviews)
          </Text>
        </View>
        <Text style={styles.hotelName}>{hotel.name}</Text>
        <View style={styles.locationContainer}>
          <Ionicons
            name="location-outline"
            size={14}
            color={Colors.textSecondary}
          />
          <Text style={styles.locationText}>{hotel.location}</Text>
        </View>
        <Text style={styles.priceText}>${hotel.price}/night</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // Vertical Card (default)
  verticalCard: {
    width: width * 0.78,
    backgroundColor: Colors.background,
    borderRadius: Spacing.lg,
    marginRight: Spacing.lg,
    overflow: "hidden",
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  verticalImageContainer: {
    position: "relative",
    width: "100%",
    height: Sizes.cardImageHeight,
    borderTopLeftRadius: Spacing.lg,
    borderTopRightRadius: Spacing.lg,
    overflow: "hidden",
  },
  verticalImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  favoriteButton: {
    position: "absolute",
    top: Spacing.md,
    right: Spacing.md,
  },
  
  // Horizontal Card
  horizontalCard: {
    flexDirection: "row",
    backgroundColor: Colors.background,
    borderRadius: Spacing.lg,
    marginBottom: Spacing.lg,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: "hidden",
  },
  horizontalImageContainer: {
    position: "relative",
    width: Sizes.cardImageHeightSmall,
    height: Sizes.cardImageHeightSmall,
    borderRadius: Spacing.md,
    overflow: "hidden",
    marginRight: Spacing.md,
    backgroundColor: Colors.backgroundGray,
  },
  horizontalImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  favoriteButtonSmall: {
    position: "absolute",
    top: Spacing.sm,
    right: Spacing.sm,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
  },
  horizontalInfo: {
    flex: 1,
    padding: Spacing.md,
    justifyContent: "space-between",
  },
  
  // Common
  verticalInfo: {
    padding: Spacing.lg,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.xs,
    gap: Spacing.xs,
  },
  ratingText: {
    fontSize: Typography.xs,
    color: Colors.text,
    fontWeight: Typography.medium,
    marginLeft: Spacing.xs,
  },
  hotelName: {
    fontSize: Typography.lg,
    fontWeight: Typography.bold,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.xs,
    gap: Spacing.xs,
  },
  locationText: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
  },
  priceText: {
    fontSize: Typography.md,
    fontWeight: Typography.bold,
    color: Colors.text,
  },
});

