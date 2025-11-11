import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { HotelCard, SearchBar } from "../../components";
import { Colors } from "../../constants/colors";
import { Spacing } from "../../constants/spacing";
import { Typography } from "../../constants/typography";
import { useFavorites } from "../../hooks/useFavorites";
import { Hotel } from "../../types/hotel";
import { searchHotels, getAllHotels } from "../../apis/hotel";
import { convertHotelResponsesToHotels } from "../../utils/hotelUtils";

export default function SearchScreen() {
  const router = useRouter();
  const { favorites, toggleFavorite, isFavorite } = useFavorites();
  const [searchQuery, setSearchQuery] = useState("");
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAllHotels();
  }, []);

  const loadAllHotels = async () => {
    try {
      setLoading(true);
      setError(null);
      const hotelsData = await getAllHotels();
      const hotelsConverted = convertHotelResponsesToHotels(
        hotelsData,
        require("../../assets/images/anh1.jpg")
      );
      setHotels(hotelsConverted);
    } catch (err: any) {
      console.error("Error loading hotels:", err);
      setError(err.message || "Không thể tải danh sách khách sạn");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      loadAllHotels();
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const searchResults = await searchHotels(query);
      const hotelsConverted = convertHotelResponsesToHotels(
        searchResults,
        require("../../assets/images/anh1.jpg")
      );
      setHotels(hotelsConverted);
    } catch (err: any) {
      console.error("Error searching hotels:", err);
      setError(err.message || "Không thể tìm kiếm khách sạn");
      Alert.alert("Lỗi", err.message || "Không thể tìm kiếm khách sạn");
    } finally {
      setLoading(false);
    }
  };

  // Filter hotels based on search query (client-side filtering as fallback)
  const filteredHotels = useMemo(() => {
    if (!searchQuery.trim()) {
      return hotels;
    }
    const query = searchQuery.toLowerCase().trim();
    return hotels.filter(
      (hotel) =>
        hotel.name.toLowerCase().includes(query) ||
        hotel.location.toLowerCase().includes(query)
    );
  }, [searchQuery, hotels]);

  const clearSearch = () => {
    setSearchQuery("");
    loadAllHotels();
  };

  const handleSearchQueryChange = (text: string) => {
    setSearchQuery(text);
    // Debounce search - chỉ search khi user ngừng gõ (có thể cải thiện sau)
    if (text.trim().length >= 2) {
      handleSearch(text);
    } else if (text.trim().length === 0) {
      loadAllHotels();
    }
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
          onChangeText={handleSearchQueryChange}
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
              onPress={() => (searchQuery ? handleSearch(searchQuery) : loadAllHotels())}
            >
              <Text style={styles.retryButtonText}>Thử lại</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
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
              ) : (
                <View style={styles.emptyState}>
                  <Ionicons name="hotel-outline" size={64} color={Colors.border} />
                  <Text style={styles.emptyStateText}>Không có khách sạn nào</Text>
                </View>
              )}
            </View>
          </>
        )}
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
