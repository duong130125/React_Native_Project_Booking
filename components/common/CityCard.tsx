import { useRouter } from "expo-router";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity } from "react-native";
import { Spacing } from "../../constants/spacing";
import { Typography } from "../../constants/typography";
import { City } from "../../types/hotel";

interface CityCardProps {
  city: City;
  onPress?: (city: City) => void;
}

export const CityCard: React.FC<CityCardProps> = ({ city, onPress }) => {
  const router = useRouter();

  const handlePress = () => {
    if (onPress) {
      onPress(city);
    } else {
      router.push({
        pathname: "/filter",
        params: { city: city.name },
      } as any);
    }
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <Image source={city.image} style={styles.image} />
      <Text style={styles.name}>{city.name}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    alignItems: "center",
    marginRight: Spacing.lg,
    width: 100,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: Spacing.lg,
    marginBottom: Spacing.sm,
    backgroundColor: "#F3F4F6",
  },
  name: {
    fontSize: Typography.sm,
    fontWeight: Typography.semiBold,
    color: "#111827",
  },
});
