import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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

export default function FilterScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const selectedCity = (params.city as string) || "Mumbai";
  const [favorites, setFavorites] = useState<number[]>([]);
  const [showSortModal, setShowSortModal] = useState(false);
  const [showLocalityModal, setShowLocalityModal] = useState(false);
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [selectedSort, setSelectedSort] = useState<
    "price-low" | "price-high" | null
  >(null);
  const [selectedLocalities, setSelectedLocalities] = useState<string[]>([]);
  const [startPrice, setStartPrice] = useState("");
  const [endPrice, setEndPrice] = useState("");
  const [filteredHotels, setFilteredHotels] = useState<Hotel[]>([]);

  useEffect(() => {
    loadFavorites();
    filterHotelsByCity();
  }, [selectedCity]);

  const loadFavorites = async () => {
    try {
      const savedFavorites = await AsyncStorage.getItem("favorites");
      if (savedFavorites) {
        setFavorites(JSON.parse(savedFavorites));
      }
    } catch (error) {
      console.error("Error loading favorites:", error);
    }
  };

  // All hotels data for different cities
  const allHotels: Hotel[] = [
    // Mumbai hotels
    {
      id: 1,
      name: "Malon Greens",
      location: "Mumbai, Maharashtra",
      price: 120,
      rating: 5.0,
      reviews: 120,
      image: require("../assets/images/image-booking.png"),
      isFavorite: false,
    },
    {
      id: 2,
      name: "Sabro Prime",
      location: "Mumbai, Maharashtra",
      price: 90,
      rating: 5.0,
      reviews: 145,
      image: require("../assets/images/image-booking.png"),
      isFavorite: false,
    },
    {
      id: 3,
      name: "Peradise Mint",
      location: "Mumbai, Maharashtra",
      price: 110,
      rating: 4.0,
      reviews: 115,
      image: require("../assets/images/image-booking.png"),
      isFavorite: false,
    },
    // Goa hotels
    {
      id: 4,
      name: "Goa Beach Resort",
      location: "Goa, Maharashtra",
      price: 150,
      rating: 4.5,
      reviews: 200,
      image: require("../assets/images/image-booking.png"),
      isFavorite: false,
    },
    {
      id: 5,
      name: "Sunset Paradise",
      location: "Goa, Maharashtra",
      price: 130,
      rating: 4.8,
      reviews: 180,
      image: require("../assets/images/image-booking.png"),
      isFavorite: false,
    },
    // Chennai hotels
    {
      id: 6,
      name: "Chennai Grand",
      location: "Chennai, Tamil Nadu",
      price: 100,
      rating: 4.2,
      reviews: 150,
      image: require("../assets/images/image-booking.png"),
      isFavorite: false,
    },
    {
      id: 7,
      name: "Marina View",
      location: "Chennai, Tamil Nadu",
      price: 95,
      rating: 4.5,
      reviews: 130,
      image: require("../assets/images/image-booking.png"),
      isFavorite: false,
    },
    // Jaipur hotels
    {
      id: 8,
      name: "Royal Palace Hotel",
      location: "Jaipur, Rajasthan",
      price: 140,
      rating: 4.7,
      reviews: 170,
      image: require("../assets/images/image-booking.png"),
      isFavorite: false,
    },
    {
      id: 9,
      name: "Pink City Resort",
      location: "Jaipur, Rajasthan",
      price: 125,
      rating: 4.3,
      reviews: 140,
      image: require("../assets/images/image-booking.png"),
      isFavorite: false,
    },
    // Pune hotels
    {
      id: 10,
      name: "Pune Heights",
      location: "Pune, Maharashtra",
      price: 105,
      rating: 4.4,
      reviews: 160,
      image: require("../assets/images/image-booking.png"),
      isFavorite: false,
    },
    {
      id: 11,
      name: "City Center Hotel",
      location: "Pune, Maharashtra",
      price: 98,
      rating: 4.1,
      reviews: 125,
      image: require("../assets/images/image-booking.png"),
      isFavorite: false,
    },
  ];

  const filterHotelsByCity = () => {
    let hotels = allHotels.filter((hotel) =>
      hotel.location.toLowerCase().includes(selectedCity.toLowerCase())
    );

    // Apply additional filters
    if (selectedSort === "price-low") {
      hotels = hotels.sort((a, b) => a.price - b.price);
    } else if (selectedSort === "price-high") {
      hotels = hotels.sort((a, b) => b.price - a.price);
    }

    if (startPrice && endPrice) {
      const start = parseInt(startPrice);
      const end = parseInt(endPrice);
      hotels = hotels.filter(
        (hotel) => hotel.price >= start && hotel.price <= end
      );
    }

    setFilteredHotels(hotels);
  };

  useEffect(() => {
    filterHotelsByCity();
  }, [selectedSort, startPrice, endPrice, selectedCity]);

  // Mock data for localities
  const localities = [
    "Andheri East",
    "Thane",
    "Bandra",
    "Dadar",
    "Navi Mumbai",
  ];

  const toggleFavorite = async (hotelId: number) => {
    try {
      const hotel = allHotels.find((h) => h.id === hotelId);
      if (!hotel) return;

      const updatedFavorites = favorites.includes(hotelId)
        ? favorites.filter((id) => id !== hotelId)
        : [...favorites, hotelId];

      setFavorites(updatedFavorites);
      await AsyncStorage.setItem("favorites", JSON.stringify(updatedFavorites));

      if (!favorites.includes(hotelId)) {
        // Add to bookmarks
        const bookmark = {
          id: Date.now().toString(),
          hotelId: hotelId.toString(),
          hotelName: hotel.name,
          location: hotel.location,
          rating: hotel.rating,
          reviews: hotel.reviews,
          price: hotel.price,
          image: hotel.image,
          savedAt: "Today",
        };

        const bookmarks = await AsyncStorage.getItem("bookmarks");
        const bookmarkList = bookmarks ? JSON.parse(bookmarks) : [];
        bookmarkList.unshift(bookmark);
        await AsyncStorage.setItem("bookmarks", JSON.stringify(bookmarkList));

        // Create notification
        const notification = {
          id: Date.now().toString(),
          type: "bookmark",
          title: `You Saved "${hotel.name}"`,
          description: "Your just bookmarked",
          date: "Today",
          image: hotel.image,
          createdAt: new Date().toISOString(),
        };

        const notifications = await AsyncStorage.getItem("notifications");
        const notificationList = notifications ? JSON.parse(notifications) : [];
        notificationList.unshift(notification);
        await AsyncStorage.setItem(
          "notifications",
          JSON.stringify(notificationList)
        );
      } else {
        // Remove from bookmarks
        const bookmarks = await AsyncStorage.getItem("bookmarks");
        if (bookmarks) {
          const bookmarkList = JSON.parse(bookmarks);
          const updatedBookmarks = bookmarkList.filter(
            (b: any) => b.hotelId !== hotelId.toString()
          );
          await AsyncStorage.setItem(
            "bookmarks",
            JSON.stringify(updatedBookmarks)
          );
        }
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const stars = [];

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Ionicons key={i} name="star" size={14} color="#FFB800" />);
    }
    if (hasHalfStar) {
      stars.push(
        <Ionicons key="half" name="star-half" size={14} color="#FFB800" />
      );
    }
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Ionicons
          key={`empty-${i}`}
          name="star-outline"
          size={14}
          color="#D1D5DB"
        />
      );
    }
    return stars;
  };

  const handleLocalityToggle = (locality: string) => {
    setSelectedLocalities((prev) =>
      prev.includes(locality)
        ? prev.filter((l) => l !== locality)
        : [...prev, locality]
    );
  };

  const handleApplyFilters = () => {
    setShowLocalityModal(false);
    setShowPriceModal(false);
    filterHotelsByCity();
  };

  const handleClearFilters = () => {
    setSelectedLocalities([]);
    setStartPrice("");
    setEndPrice("");
    setSelectedSort(null);
    filterHotelsByCity();
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{selectedCity}</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Filter Bar */}
      <View style={styles.filterBar}>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowSortModal(true)}
        >
          <Ionicons name="swap-vertical-outline" size={16} color="#6B7280" />
          <Text style={styles.filterButtonText}>Sort</Text>
          <Ionicons name="chevron-down" size={16} color="#6B7280" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowLocalityModal(true)}
        >
          <Text style={styles.filterButtonText}>Locality</Text>
          <Ionicons name="chevron-down" size={16} color="#6B7280" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowPriceModal(true)}
        >
          <Text style={styles.filterButtonText}>Price</Text>
          <Ionicons name="chevron-down" size={16} color="#6B7280" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hotels List */}
        <View style={styles.section}>
          {filteredHotels.length > 0 ? (
            filteredHotels.map((hotel) => (
              <TouchableOpacity
                key={hotel.id}
                style={styles.hotelCardLarge}
                onPress={() => {
                  router.push({
                    pathname: "/hotel-detail",
                    params: { hotelId: hotel.id.toString() },
                  } as any);
                }}
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
                        favorites.includes(hotel.id) ? "heart" : "heart-outline"
                      }
                      size={20}
                      color={
                        favorites.includes(hotel.id) ? "#EF4444" : "#FFFFFF"
                      }
                    />
                  </TouchableOpacity>
                </View>
                <View style={styles.hotelInfoLarge}>
                  <View style={styles.ratingContainer}>
                    <View style={styles.starsContainer}>
                      {renderStars(hotel.rating)}
                    </View>
                    <Text style={styles.ratingText}>
                      {hotel.rating.toFixed(1)} ({hotel.reviews} Reviews)
                    </Text>
                  </View>
                  <Text style={styles.hotelName}>{hotel.name}</Text>
                  <View style={styles.locationContainer}>
                    <Ionicons
                      name="location-outline"
                      size={14}
                      color="#6B7280"
                    />
                    <Text style={styles.locationText}>{hotel.location}</Text>
                  </View>
                  <Text style={styles.price}>${hotel.price}/night</Text>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="search-outline" size={64} color="#D1D5DB" />
              <Text style={styles.emptyStateText}>
                No hotels found in {selectedCity}
              </Text>
              <Text style={styles.emptyStateSubtext}>
                Try selecting a different city or adjusting your filters
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Sort Modal */}
      <Modal
        visible={showSortModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSortModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowSortModal(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Sort by</Text>

            <TouchableOpacity
              style={styles.sortOption}
              onPress={() => {
                setSelectedSort("price-low");
                setShowSortModal(false);
                filterHotelsByCity();
              }}
            >
              <Ionicons name="cash-outline" size={20} color="#111827" />
              <Text style={styles.sortOptionText}>Price - low to high</Text>
              {selectedSort === "price-low" && (
                <Ionicons name="checkmark" size={20} color="#4F46E5" />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.sortOption}
              onPress={() => {
                setSelectedSort("price-high");
                setShowSortModal(false);
                filterHotelsByCity();
              }}
            >
              <Ionicons name="cash-outline" size={20} color="#111827" />
              <Text style={styles.sortOptionText}>Price - high to low</Text>
              {selectedSort === "price-high" && (
                <Ionicons name="checkmark" size={20} color="#4F46E5" />
              )}
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Locality Modal */}
      <Modal
        visible={showLocalityModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowLocalityModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowLocalityModal(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Locality</Text>

            <ScrollView style={styles.modalScrollView}>
              {localities.map((locality, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.checkboxOption}
                  onPress={() => handleLocalityToggle(locality)}
                >
                  <View
                    style={[
                      styles.checkbox,
                      selectedLocalities.includes(locality) &&
                        styles.checkboxChecked,
                    ]}
                  >
                    {selectedLocalities.includes(locality) && (
                      <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                    )}
                  </View>
                  <Text style={styles.checkboxOptionText}>{locality}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity>
                <Text style={styles.showMoreText}>Show more</Text>
              </TouchableOpacity>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.clearButton}
                onPress={handleClearFilters}
              >
                <Text style={styles.clearButtonText}>Clear All</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.applyButton}
                onPress={handleApplyFilters}
              >
                <Text style={styles.applyButtonText}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Price Modal */}
      <Modal
        visible={showPriceModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPriceModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowPriceModal(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Price</Text>

            <View style={styles.priceInputContainer}>
              <View style={styles.priceInputGroup}>
                <Text style={styles.priceInputLabel}>Giá bắt đầu</Text>
                <TextInput
                  style={styles.priceInput}
                  placeholder="0"
                  placeholderTextColor="#9CA3AF"
                  value={startPrice}
                  onChangeText={setStartPrice}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.priceInputGroup}>
                <Text style={styles.priceInputLabel}>Giá kết thúc</Text>
                <TextInput
                  style={styles.priceInput}
                  placeholder="1000"
                  placeholderTextColor="#9CA3AF"
                  value={endPrice}
                  onChangeText={setEndPrice}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.clearButton}
                onPress={() => {
                  setStartPrice("");
                  setEndPrice("");
                  setShowPriceModal(false);
                }}
              >
                <Text style={styles.clearButtonText}>Clear All</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.applyButton}
                onPress={handleApplyFilters}
              >
                <Text style={styles.applyButtonText}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  headerRight: {
    width: 24,
  },
  filterBar: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    gap: 12,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    flex: 1,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#111827",
  },
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  hotelCardLarge: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: "hidden",
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
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    alignItems: "center",
    justifyContent: "center",
  },
  hotelInfoLarge: {
    padding: 16,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 6,
  },
  starsContainer: {
    flexDirection: "row",
    gap: 2,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#111827",
  },
  hotelName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 6,
  },
  locationText: {
    fontSize: 14,
    color: "#6B7280",
  },
  price: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingBottom: 32,
    maxHeight: "80%",
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: "#D1D5DB",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  modalScrollView: {
    paddingHorizontal: 20,
    maxHeight: 400,
  },
  sortOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  sortOptionText: {
    flex: 1,
    fontSize: 16,
    color: "#111827",
  },
  checkboxOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: {
    backgroundColor: "#4F46E5",
    borderColor: "#4F46E5",
  },
  checkboxOptionText: {
    fontSize: 16,
    color: "#111827",
  },
  showMoreText: {
    fontSize: 14,
    color: "#4F46E5",
    marginTop: 8,
  },
  priceInputContainer: {
    paddingHorizontal: 20,
    gap: 16,
    marginBottom: 20,
  },
  priceInputGroup: {
    gap: 8,
  },
  priceInputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#111827",
  },
  priceInput: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#111827",
  },
  modalActions: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 12,
    marginTop: 20,
  },
  clearButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    alignItems: "center",
  },
  clearButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  applyButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#4F46E5",
    alignItems: "center",
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 64,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
  },
});
