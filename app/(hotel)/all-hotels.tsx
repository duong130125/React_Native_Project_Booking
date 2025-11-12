import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getAllHotels, searchHotels } from "../../apis/hotel";
import { HotelCard } from "../../components/hotel/HotelCard";
import { Colors } from "../../constants/colors";
import { Spacing } from "../../constants/spacing";
import { Typography } from "../../constants/typography";
import { useFavorites } from "../../hooks/useFavorites";
import { HotelResponse } from "../../types/hotel";
import { convertHotelResponsesToHotels } from "../../utils/hotelUtils";

export default function AllHotelsScreen() {
  const router = useRouter();
  const { favorites, toggleFavorite, isFavorite } = useFavorites();
  const [hotels, setHotels] = useState<HotelResponse[]>([]);
  const [displayedHotels, setDisplayedHotels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<TextInput>(null);

  useEffect(() => {
    loadHotels();
  }, []);

  useEffect(() => {
    // Debounce search để tránh gọi API quá nhiều lần và giữ bàn phím
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        performSearch(searchQuery.trim());
      } else {
        // Nếu không có search query, hiển thị tất cả hotels đã load
        if (hotels.length > 0) {
          const hotelsConverted = convertHotelResponsesToHotels(
            hotels,
            require("../../assets/images/anh1.jpg")
          );
          setDisplayedHotels(hotelsConverted);
        }
      }
    }, 500); // Tăng debounce lên 500ms để giảm số lần gọi API

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  const loadHotels = async () => {
    try {
      setLoading(true);
      setError(null);

      const hotelsData = await getAllHotels();

      // Convert API response sang Hotel type
      const hotelsConverted = convertHotelResponsesToHotels(
        hotelsData,
        require("../../assets/images/anh1.jpg")
      );

      setHotels(hotelsData);
      setDisplayedHotels(hotelsConverted);
    } catch (err: any) {
      console.error("Error loading hotels:", err);
      setError(err.message || "Không thể tải danh sách khách sạn");
    } finally {
      setLoading(false);
    }
  };

  const performSearch = async (keyword: string) => {
    try {
      setSearching(true);
      setError(null);

      // Gọi API search
      const searchResults = await searchHotels(keyword);

      // Convert API response sang Hotel type
      const hotelsConverted = convertHotelResponsesToHotels(
        searchResults,
        require("../../assets/images/anh1.jpg")
      );

      setDisplayedHotels(hotelsConverted);
    } catch (err: any) {
      console.error("Error searching hotels:", err);
      setError(err.message || "Không thể tìm kiếm khách sạn");
      // Nếu search lỗi, hiển thị empty list
      setDisplayedHotels([]);
    } finally {
      setSearching(false);
    }
  };

  const handleHotelPress = (hotelId: number) => {
    router.push({
      pathname: "/(hotel)/hotel-detail",
      params: { hotelId: hotelId.toString() },
    });
  };

  const renderHotel = ({ item }: { item: any }) => (
    <View style={styles.hotelItemContainer}>
      <TouchableOpacity
        onPress={() => handleHotelPress(item.id)}
        activeOpacity={0.7}
      >
        <HotelCard
          hotel={item}
          isFavorite={isFavorite(item.id)}
          onToggleFavorite={toggleFavorite}
          variant="horizontal"
        />
      </TouchableOpacity>
    </View>
  );

  const renderHeader = useCallback(
    () => (
      <View style={styles.headerContainer}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color={Colors.text} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Tất cả khách sạn</Text>
            <View style={styles.placeholder} />
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Ionicons
              name="search-outline"
              size={20}
              color={Colors.textSecondary}
              style={styles.searchIcon}
            />
            <TextInput
              ref={searchInputRef}
              style={styles.searchInput}
              placeholder="Tìm kiếm khách sạn, thành phố..."
              placeholderTextColor={Colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="search"
              blurOnSubmit={false}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchQuery("")}
                style={styles.clearButton}
              >
                <Ionicons
                  name="close-circle"
                  size={20}
                  color={Colors.textSecondary}
                />
              </TouchableOpacity>
            )}
          </View>

          {/* Results Count */}
          <Text style={styles.resultsText}>
            {displayedHotels.length} khách sạn
            {searchQuery ? ` cho "${searchQuery}"` : ""}
          </Text>
        </View>
      </View>
    ),
    [searchQuery, displayedHotels.length, router]
  );

  const renderEmpty = () => {
    if (loading || searching) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.emptyText}>
            {searching ? "Đang tìm kiếm..." : "Đang tải..."}
          </Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons
            name="alert-circle-outline"
            size={64}
            color={Colors.error}
          />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadHotels}>
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Ionicons
          name="search-outline"
          size={64}
          color={Colors.textSecondary}
        />
        <Text style={styles.emptyText}>
          {searchQuery
            ? "Không tìm thấy khách sạn nào"
            : "Không có khách sạn nào"}
        </Text>
        {searchQuery && (
          <TouchableOpacity
            onPress={() => setSearchQuery("")}
            style={styles.clearSearchButton}
          >
            <Text style={styles.clearSearchButtonText}>Xóa tìm kiếm</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar style="dark" />
      {renderHeader()}
      <FlatList
        data={displayedHotels}
        renderItem={renderHotel}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={
          displayedHotels.length === 0
            ? styles.emptyListContent
            : styles.listContent
        }
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="none"
        removeClippedSubviews={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerWrapper: {
    width: "100%",
  },
  headerContainer: {
    width: "100%",
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
    width: "100%",
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.lg,
  },
  backButton: {
    padding: Spacing.xs,
  },
  headerTitle: {
    fontSize: Typography.xl,
    fontWeight: Typography.bold,
    color: Colors.text,
    flex: 1,
    textAlign: "center",
  },
  placeholder: {
    width: 40,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchIcon: {
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: Typography.md,
    color: Colors.text,
    paddingVertical: Spacing.md,
  },
  clearButton: {
    padding: Spacing.xs,
  },
  resultsText: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  listContent: {
    paddingBottom: 120,
  },
  emptyListContent: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 64,
    paddingHorizontal: Spacing.xl,
  },
  emptyText: {
    fontSize: Typography.md,
    color: Colors.textSecondary,
    marginTop: Spacing.lg,
    textAlign: "center",
  },
  errorText: {
    fontSize: Typography.md,
    color: Colors.error,
    marginTop: Spacing.lg,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: 8,
    marginTop: Spacing.lg,
  },
  retryButtonText: {
    color: Colors.background,
    fontSize: Typography.md,
    fontWeight: Typography.semiBold,
  },
  clearSearchButton: {
    marginTop: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  clearSearchButtonText: {
    fontSize: Typography.sm,
    color: Colors.primary,
    fontWeight: Typography.semiBold,
  },
  hotelItemContainer: {
    paddingHorizontal: Spacing.xl,
  },
});
