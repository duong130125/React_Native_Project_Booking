import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
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
import {
  getAllHotels,
  getBestHotels,
  getFeaturedHotels,
} from "../../apis/hotel";
import { CityCard, Header, HotelCard } from "../../components";
import { Colors } from "../../constants/colors";
import { Spacing } from "../../constants/spacing";
import { Typography } from "../../constants/typography";
import { useFavorites } from "../../hooks/useFavorites";
import { City, Hotel } from "../../types/hotel";
import { getCitiesFromHotels } from "../../utils/cityUtils";
import { convertHotelResponsesToHotels } from "../../utils/hotelUtils";

export default function HomepageScreen() {
  const router = useRouter();
  const { favorites, toggleFavorite, isFavorite } = useFavorites();
  const [bestHotels, setBestHotels] = useState<Hotel[]>([]);
  const [nearbyHotels, setNearbyHotels] = useState<Hotel[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadHotels();
  }, []);

  const loadHotels = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load tất cả hotels để lấy cities và featured hotels
      const [bestHotelsData, featuredHotelsData, allHotelsData] =
        await Promise.all([
          getBestHotels().catch((err) => {
            console.error("Error loading best hotels:", err);
            return [];
          }),
          getFeaturedHotels().catch((err) => {
            console.error("Error loading featured hotels:", err);
            return [];
          }),
          getAllHotels().catch((err) => {
            console.error("Error loading all hotels:", err);
            return [];
          }),
        ]);

      // Convert API response sang Hotel type
      const bestHotelsConverted = convertHotelResponsesToHotels(
        bestHotelsData,
        require("../../assets/images/anh1.jpg")
      );
      const featuredHotelsConverted = convertHotelResponsesToHotels(
        featuredHotelsData,
        require("../../assets/images/anh2.jpg")
      );

      // Tạo cities từ hotels
      const defaultImages = [
        require("../../assets/images/anh1.jpg"),
        require("../../assets/images/anh2.jpg"),
        require("../../assets/images/anh3.jpg"),
        require("../../assets/images/anh4.jpg"),
        require("../../assets/images/anh5.jpg"),
        require("../../assets/images/anh6.jpg"),
      ];
      const citiesFromHotels = getCitiesFromHotels(
        allHotelsData,
        defaultImages
      );

      setBestHotels(bestHotelsConverted);
      setNearbyHotels(featuredHotelsConverted);
      setCities(citiesFromHotels);
    } catch (err: any) {
      console.error("Error loading hotels:", err);
      setError(err.message || "Không thể tải danh sách khách sạn");
      Alert.alert("Lỗi", err.message || "Không thể tải danh sách khách sạn");
    } finally {
      setLoading(false);
    }
  };

  // Mock data for cities (có thể lấy từ API sau)

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
        {cities.length > 0 && (
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
        )}

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Đang tải...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={loadHotels}>
              <Text style={styles.retryButtonText}>Thử lại</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Best Hotels Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Best Hotels</Text>
                <TouchableOpacity>
                  <Text style={styles.seeAllText}>See All</Text>
                </TouchableOpacity>
              </View>

              {bestHotels.length > 0 ? (
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
              ) : (
                <Text style={styles.emptyText}>Không có khách sạn nào</Text>
              )}
            </View>

            {/* Nearby Hotels Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Nearby your location</Text>
                <TouchableOpacity>
                  <Text style={styles.seeAllText}>See All</Text>
                </TouchableOpacity>
              </View>

              {nearbyHotels.length > 0 ? (
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
              ) : (
                <Text style={styles.emptyText}>Không có khách sạn nào</Text>
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
  emptyText: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    textAlign: "center",
    paddingVertical: Spacing.xl,
  },
});
