import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
import { getHotelsByCity } from "../../apis/hotel";
import { Colors } from "../../constants/colors";
import { Spacing } from "../../constants/spacing";
import { Typography } from "../../constants/typography";
import { useFavorites } from "../../hooks/useFavorites";
import { Hotel } from "../../types/hotel";
import { convertHotelResponsesToHotels } from "../../utils/hotelUtils";

export default function FilterScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const selectedCity = (params.city as string) || "";
  const { favorites, toggleFavorite, isFavorite } = useFavorites();
  const [showSortModal, setShowSortModal] = useState(false);
  const [showLocalityModal, setShowLocalityModal] = useState(false);
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [selectedSort, setSelectedSort] = useState<
    "price-low" | "price-high" | null
  >(null);
  const [selectedLocalities, setSelectedLocalities] = useState<string[]>([]);
  const [startPrice, setStartPrice] = useState("");
  const [endPrice, setEndPrice] = useState("");
  const [allHotels, setAllHotels] = useState<Hotel[]>([]);
  const [filteredHotels, setFilteredHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedCity) {
      loadHotelsByCity();
    }
  }, [selectedCity]);

  useEffect(() => {
    if (selectedCity && allHotels.length > 0) {
      applyFilters();
    }
  }, [selectedSort, startPrice, endPrice]);

  const loadHotelsByCity = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!selectedCity) {
        setLoading(false);
        return;
      }

      const hotelsData = await getHotelsByCity(selectedCity);
      const hotelsConverted = convertHotelResponsesToHotels(
        hotelsData,
        require("../../assets/images/image-booking.png")
      );

      setAllHotels(hotelsConverted);
      setFilteredHotels(hotelsConverted);
    } catch (err: any) {
      console.error("Error loading hotels by city:", err);
      setError(err.message || "Không thể tải danh sách khách sạn");
      Alert.alert("Lỗi", err.message || "Không thể tải danh sách khách sạn");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let hotels = [...allHotels];

    // Price filter
    if (startPrice && endPrice) {
      const start = parseInt(startPrice);
      const end = parseInt(endPrice);
      hotels = hotels.filter(
        (hotel) => hotel.price >= start && hotel.price <= end
      );
    }

    // Sort
    if (selectedSort === "price-low") {
      hotels = hotels.sort((a, b) => a.price - b.price);
    } else if (selectedSort === "price-high") {
      hotels = hotels.sort((a, b) => b.price - a.price);
    }

    setFilteredHotels(hotels);
  };

  // Mock data for localities
  const localities = [
    "Andheri East",
    "Thane",
    "Bandra",
    "Dadar",
    "Navi Mumbai",
  ];

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const stars: React.ReactNode[] = [];

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
    applyFilters();
  };

  const handleClearFilters = () => {
    setSelectedLocalities([]);
    setStartPrice("");
    setEndPrice("");
    setSelectedSort(null);
    if (selectedCity) {
      loadHotelsByCity();
    }
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
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Đang tải...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={loadHotelsByCity}
            >
              <Text style={styles.retryButtonText}>Thử lại</Text>
            </TouchableOpacity>
          </View>
        ) : (
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
                      onPress={() => toggleFavorite(hotel)}
                    >
                      <Ionicons
                        name={isFavorite(hotel.id) ? "heart" : "heart-outline"}
                        size={20}
                        color={isFavorite(hotel.id) ? "#EF4444" : "#FFFFFF"}
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
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="search-outline" size={64} color="#D1D5DB" />
                <Text style={styles.emptyStateText}>
                  Không tìm thấy khách sạn ở {selectedCity}
                </Text>
                <Text style={styles.emptyStateSubtext}>
                  Thử chọn thành phố khác hoặc điều chỉnh bộ lọc
                </Text>
              </View>
            )}
          </View>
        )}
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
                applyFilters();
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
                applyFilters();
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
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 64,
  },
  loadingText: {
    marginTop: 16,
    fontSize: Typography.sm,
    color: Colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 64,
    paddingHorizontal: Spacing.xl,
  },
  errorText: {
    fontSize: Typography.md,
    color: Colors.error,
    textAlign: "center",
    marginBottom: Spacing.lg,
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: 8,
  },
  retryButtonText: {
    color: Colors.background,
    fontSize: Typography.md,
    fontWeight: Typography.semiBold,
  },
});
