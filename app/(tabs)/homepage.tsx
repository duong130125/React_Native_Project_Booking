import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

interface Hotel {
  id: number;
  name: string;
  location: string;
  price: number;
  rating: number;
  reviews: number;
  image: any;
  isFavorite: boolean;
}

export default function HomepageScreen() {
  const router = useRouter();
  const [favorites, setFavorites] = useState<number[]>([]);

  // Mock data for cities
  const cities = [
    { id: 1, name: "Mumbai", image: require("../../assets/images/image-booking.png") },
    { id: 2, name: "Goa", image: require("../../assets/images/image-booking.png") },
    { id: 3, name: "Chennai", image: require("../../assets/images/image-booking.png") },
    { id: 4, name: "Jaipur", image: require("../../assets/images/image-booking.png") },
    { id: 5, name: "Puri", image: require("../../assets/images/image-booking.png") },
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
      image: require("../../assets/images/image-booking.png"),
      isFavorite: false,
    },
    {
      id: 2,
      name: "Fortune Lan",
      location: "Goa, Maharashtra",
      price: 150,
      rating: 5.0,
      reviews: 95,
      image: require("../../assets/images/image-booking.png"),
      isFavorite: false,
    },
    {
      id: 3,
      name: "Grand Plaza",
      location: "Chennai, Tamil Nadu",
      price: 180,
      rating: 4.5,
      reviews: 200,
      image: require("../../assets/images/image-booking.png"),
      isFavorite: false,
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
      image: require("../../assets/images/image-booking.png"),
      isFavorite: false,
    },
    {
      id: 5,
      name: "Sabro Prime",
      location: "Mumbai, Maharashtra",
      price: 90,
      rating: 5.0,
      reviews: 76,
      image: require("../../assets/images/image-booking.png"),
      isFavorite: false,
    },
    {
      id: 6,
      name: "Peradise Mint",
      location: "Mumbai, Maharashtra",
      price: 120,
      rating: 4.0,
      reviews: 115,
      image: require("../../assets/images/image-booking.png"),
      isFavorite: false,
    },
  ];

  const toggleFavorite = (hotelId: number) => {
    setFavorites((prev) =>
      prev.includes(hotelId)
        ? prev.filter((id) => id !== hotelId)
        : [...prev, hotelId]
    );
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Ionicons key={i} name="star" size={14} color="#FFB800" />
      );
    }
    if (hasHalfStar) {
      stars.push(
        <Ionicons key="half" name="star-half" size={14} color="#FFB800" />
      );
    }
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Ionicons key={`empty-${i}`} name="star-outline" size={14} color="#FFB800" />
      );
    }
    return stars;
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        {/* Menu Icon */}
        <TouchableOpacity style={styles.menuIcon}>
          <Ionicons name="grid-outline" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Logo */}
        <View style={styles.logoContainer}>
          <View style={styles.logoCurve} />
          <Text style={styles.logoText}>live</Text>
          <Text style={styles.logoText}> Green</Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search-outline" size={20} color="#9CA3AF" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search"
              placeholderTextColor="#9CA3AF"
            />
          </View>
          <TouchableOpacity style={styles.filterButton}>
            <Ionicons name="options-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

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
            <TouchableOpacity key={city.id} style={styles.cityCard}>
              <Image source={city.image} style={styles.cityImage} />
              <Text style={styles.cityName}>{city.name}</Text>
            </TouchableOpacity>
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
              <TouchableOpacity
                key={hotel.id}
                style={styles.hotelCard}
                activeOpacity={0.8}
              >
                <View style={styles.hotelImageContainer}>
                  <Image source={hotel.image} style={styles.hotelImage} />
                  <TouchableOpacity
                    style={styles.favoriteButton}
                    onPress={() => toggleFavorite(hotel.id)}
                  >
                    <Ionicons
                      name={
                        favorites.includes(hotel.id)
                          ? "heart"
                          : "heart-outline"
                      }
                      size={20}
                      color={
                        favorites.includes(hotel.id) ? "#EF4444" : "#FFFFFF"
                      }
                    />
                  </TouchableOpacity>
                </View>

                <View style={styles.hotelInfo}>
                  <View style={styles.ratingContainer}>
                    <View style={styles.starsContainer}>
                      {renderStars(hotel.rating)}
                    </View>
                    <Text style={styles.ratingText}>
                      {hotel.rating} ({hotel.reviews} Reviews)
                    </Text>
                  </View>

                  <Text style={styles.hotelName}>{hotel.name}</Text>

                  <View style={styles.locationContainer}>
                    <Ionicons name="location-outline" size={14} color="#6B7280" />
                    <Text style={styles.locationText}>{hotel.location}</Text>
                  </View>

                  <Text style={styles.priceText}>${hotel.price}/night</Text>
                </View>
              </TouchableOpacity>
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
              <TouchableOpacity
                key={hotel.id}
                style={styles.nearbyHotelCard}
                activeOpacity={0.8}
              >
                <View style={styles.nearbyHotelImageContainer}>
                  <Image
                    source={hotel.image}
                    style={styles.nearbyHotelImage}
                  />
                  <TouchableOpacity
                    style={styles.favoriteButton}
                    onPress={() => toggleFavorite(hotel.id)}
                  >
                    <Ionicons
                      name={
                        favorites.includes(hotel.id)
                          ? "heart"
                          : "heart-outline"
                      }
                      size={20}
                      color={
                        favorites.includes(hotel.id) ? "#EF4444" : "#FFFFFF"
                      }
                    />
                  </TouchableOpacity>
                </View>

                <View style={styles.nearbyHotelInfo}>
                  <View style={styles.ratingContainer}>
                    <View style={styles.starsContainer}>
                      {renderStars(hotel.rating)}
                    </View>
                    <Text style={styles.ratingText}>
                      {hotel.rating} ({hotel.reviews} Reviews)
                    </Text>
                  </View>

                  <Text style={styles.hotelName}>{hotel.name}</Text>

                  <View style={styles.locationContainer}>
                    <Ionicons name="location-outline" size={14} color="#6B7280" />
                    <Text style={styles.locationText}>{hotel.location}</Text>
                  </View>

                  <Text style={styles.priceText}>${hotel.price}/night</Text>
                </View>
              </TouchableOpacity>
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
    backgroundColor: "#FFFFFF",
  },
  header: {
    backgroundColor: "#4F46E5",
    paddingTop: 8,
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  menuIcon: {
    marginBottom: 12,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    position: "relative",
  },
  logoCurve: {
    position: "absolute",
    top: -8,
    left: 0,
    width: 40,
    height: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 2,
    borderBottomWidth: 0,
    borderColor: "#FFFFFF",
  },
  logoText: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#111827",
  },
  filterButton: {
    width: 48,
    height: 48,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  cityScroll: {
    marginTop: 20,
    marginBottom: 8,
  },
  cityScrollContent: {
    paddingHorizontal: 20,
    gap: 16,
  },
  cityCard: {
    alignItems: "center",
    marginRight: 16,
  },
  cityImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginBottom: 8,
  },
  cityName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#111827",
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4F46E5",
  },
  hotelScrollContent: {
    gap: 16,
    paddingRight: 20,
  },
  hotelCard: {
    width: width * 0.75,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginRight: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  hotelImageContainer: {
    position: "relative",
    width: "100%",
    height: 200,
  },
  hotelImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  favoriteButton: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  hotelInfo: {
    padding: 16,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 6,
  },
  starsContainer: {
    flexDirection: "row",
    gap: 2,
  },
  ratingText: {
    fontSize: 12,
    color: "#111827",
    fontWeight: "500",
  },
  hotelName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 6,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 4,
  },
  locationText: {
    fontSize: 14,
    color: "#6B7280",
  },
  priceText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  nearbyHotelsContainer: {
    gap: 16,
  },
  nearbyHotelCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  nearbyHotelImageContainer: {
    position: "relative",
    width: 140,
    height: 140,
  },
  nearbyHotelImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  nearbyHotelInfo: {
    flex: 1,
    padding: 16,
    justifyContent: "space-between",
  },
});

