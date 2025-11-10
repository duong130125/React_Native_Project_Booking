import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CityCard, Header, HotelCard } from "../../components";
import { Colors } from "../../constants/colors";
import { Spacing } from "../../constants/spacing";
import { Typography } from "../../constants/typography";
import { useFavorites } from "../../hooks/useFavorites";
import { City, Hotel } from "../../types/hotel";

export default function HomepageScreen() {
  const router = useRouter();
  const { favorites, toggleFavorite, isFavorite } = useFavorites();

  // Mock data for cities
  const cities: City[] = [
    {
      id: 1,
      name: "Mumbai",
      image: require("../../assets/images/anh3.jpg"),
    },
    {
      id: 2,
      name: "Goa",
      image: require("../../assets/images/anh1.jpg"),
    },
    {
      id: 3,
      name: "Chennai",
      image: require("../../assets/images/anh3.jpg"),
    },
    {
      id: 4,
      name: "Jaipur",
      image: require("../../assets/images/anh2.jpg"),
    },
    {
      id: 5,
      name: "Pune",
      image: require("../../assets/images/anh3.jpg"),
    },
  ];

  // Mock data for best hotels
  const bestHotels: Hotel[] = [
    {
      id: 1,
      name: "Malon Greens",
      location: "Mumbai, Maharashtra",
      price: 120,
      rating: 5.0,
      reviews: 120,
      image: require("../../assets/images/anh1.jpg"),
    },
    {
      id: 2,
      name: "Fortune Lane",
      location: "Goa, Maharashtra",
      price: 150,
      rating: 5.0,
      reviews: 95,
      image: require("../../assets/images/anh2.jpg"),
    },
    {
      id: 3,
      name: "Grand Plaza",
      location: "Chennai, Tamil Nadu",
      price: 180,
      rating: 4.5,
      reviews: 200,
      image: require("../../assets/images/anh3.jpg"),
    },
  ];

  // Mock data for nearby hotels
  const nearbyHotels: Hotel[] = [
    {
      id: 4,
      name: "Malon Greens",
      location: "Mumbai, Maharashtra",
      price: 110,
      rating: 4.0,
      reviews: 80,
      image: require("../../assets/images/anh3.jpg"),
    },
    {
      id: 5,
      name: "Sabro Prime",
      location: "Mumbai, Maharashtra",
      price: 90,
      rating: 5.0,
      reviews: 76,
      image: require("../../assets/images/anh2.jpg"),
    },
    {
      id: 6,
      name: "Peradise Mint",
      location: "Mumbai, Maharashtra",
      price: 120,
      rating: 4.0,
      reviews: 115,
      image: require("../../assets/images/anh1.jpg"),
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar style="light" />

      {/* Header */}
      <Header />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* City Categories */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.cityScroll}
          contentContainerStyle={styles.cityScrollContent}
        >
          {cities.map((city) => (
            <CityCard key={city.id} city={city} />
          ))}
        </ScrollView>

        {/* Best Hotels Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Best Hotels</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.hotelScrollContent}
          >
            {bestHotels.map((hotel) => (
              <HotelCard
                key={hotel.id}
                hotel={hotel}
                isFavorite={isFavorite(hotel.id)}
                onToggleFavorite={toggleFavorite}
                variant="vertical"
              />
            ))}
          </ScrollView>
        </View>

        {/* Nearby Hotels Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Nearby your location</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.nearbyHotelsContainer}>
            {nearbyHotels.map((hotel) => (
              <HotelCard
                key={hotel.id}
                hotel={hotel}
                isFavorite={isFavorite(hotel.id)}
                onToggleFavorite={toggleFavorite}
                variant="horizontal"
              />
            ))}
          </View>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  cityScroll: {
    marginTop: Spacing.xxl,
    marginBottom: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  cityScrollContent: {
    paddingHorizontal: Spacing.xl,
    gap: Spacing.lg,
  },
  section: {
    marginTop: Spacing.xxxl,
    paddingHorizontal: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.lg,
    fontWeight: Typography.bold,
    color: Colors.text,
  },
  seeAllText: {
    fontSize: Typography.sm,
    fontWeight: Typography.semiBold,
    color: Colors.info,
  },
  hotelScrollContent: {
    gap: Spacing.lg,
    paddingRight: Spacing.xl,
  },
  nearbyHotelsContainer: {
    gap: 0,
  },
});
