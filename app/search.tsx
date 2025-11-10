import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useMemo, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { HotelCard, SearchBar } from "../components";
import { Colors } from "../constants/colors";
import { Spacing } from "../constants/spacing";
import { Typography } from "../constants/typography";
import { useFavorites } from "../hooks/useFavorites";
import { Hotel } from "../types/hotel";

export default function SearchScreen() {
  const router = useRouter();
  const { favorites, toggleFavorite, isFavorite } = useFavorites();
  const [searchQuery, setSearchQuery] = useState("");

  // Mock data for hotels
  const allHotels: Hotel[] = [
    {
      id: 1,
      name: "Peradise Mint",
      location: "Mumbai, Maharashtra",
      price: 120,
      rating: 4.0,
      reviews: 115,
      image: require("../assets/images/anh1.jpg"),
    },
    {
      id: 2,
      name: "Sabro Prime",
      location: "Mumbai, Maharashtra",
      price: 90,
      rating: 5.0,
      reviews: 76,
      image: require("../assets/images/anh2.jpg"),
    },
    {
      id: 3,
      name: "Malon Greens",
      location: "Mumbai, Maharashtra",
      price: 110,
      rating: 4.0,
      reviews: 80,
      image: require("../assets/images/anh3.jpg"),
    },
    {
      id: 4,
      name: "Goa Beach Resort",
      location: "Goa, Maharashtra",
      price: 150,
      rating: 4.5,
      reviews: 200,
      image: require("../assets/images/anh4.jpg"),
    },
    {
      id: 5,
      name: "Chennai Grand",
      location: "Chennai, Tamil Nadu",
      price: 100,
      rating: 4.2,
      reviews: 150,
      image: require("../assets/images/anh6.jpg"),
    },
    {
      id: 6,
      name: "Jaipur Palace",
      location: "Jaipur, Rajasthan",
      price: 140,
      rating: 4.7,
      reviews: 170,
      image: require("../assets/images/anh5.jpg"),
    },
  ];

  // Filter hotels based on search query
  const filteredHotels = useMemo(() => {
    if (!searchQuery.trim()) {
      return allHotels;
    }
    const query = searchQuery.toLowerCase().trim();
    return allHotels.filter(
      (hotel) =>
        hotel.name.toLowerCase().includes(query) ||
        hotel.location.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const clearSearch = () => {
    setSearchQuery("");
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar style="dark" />

      {/* Header with Search Bar */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          onClear={clearSearch}
          autoFocus
        />
      </View>

      {/* Location Option */}
      <View style={styles.searchSection}>
        <TouchableOpacity style={styles.locationOption}>
          <Ionicons name="location" size={20} color={Colors.primary} />
          <Text style={styles.locationOptionText}>
            or use my current location
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Recent Search Section */}
        {!searchQuery && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Search</Text>
          </View>
        )}

        {/* Hotels Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {searchQuery ? "Search Results" : "Nearby your location"}
          </Text>
          {filteredHotels.length > 0 ? (
            filteredHotels.map((hotel) => (
              <HotelCard
                key={hotel.id}
                hotel={hotel}
                isFavorite={isFavorite(hotel.id)}
                onToggleFavorite={toggleFavorite}
                variant="horizontal"
              />
            ))
          ) : searchQuery ? (
            <View style={styles.emptyState}>
              <Ionicons name="search-outline" size={64} color={Colors.border} />
              <Text style={styles.emptyStateText}>No results found</Text>
              <Text style={styles.emptyStateSubtext}>
                Try searching with different keywords
              </Text>
            </View>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    backgroundColor: Colors.background,
    gap: Spacing.md,
  },
  backButton: {
    padding: Spacing.xs,
  },
  searchSection: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.md,
  },
  locationOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  locationOptionText: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
  },
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xxl,
  },
  sectionTitle: {
    fontSize: Typography.lg,
    fontWeight: Typography.bold,
    color: Colors.text,
    marginBottom: Spacing.lg,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 64,
  },
  emptyStateText: {
    fontSize: Typography.lg,
    fontWeight: Typography.semiBold,
    color: Colors.text,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  emptyStateSubtext: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    textAlign: "center",
  },
});
