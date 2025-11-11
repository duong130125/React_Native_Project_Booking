import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getUpcomingBookings, getAllUserBookings, cancelBooking } from "../../apis/booking";
import { BookingResponse } from "../../types/hotel";
import { Booking } from "../../types/hotel";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Colors } from "../../constants/colors";
import { Typography } from "../../constants/typography";
import { Spacing } from "../../constants/spacing";

export default function OrdersScreen() {
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState<"upcoming" | "past">(
    "upcoming"
  );
  const [upcomingBookings, setUpcomingBookings] = useState<Booking[]>([]);
  const [pastBookings, setPastBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadBookings();
  }, []);

  useEffect(() => {
    loadBookings();
  }, [selectedTab]);

  const convertBookingResponseToBooking = (
    bookingResponse: BookingResponse
  ): Booking => {
    const hotel = bookingResponse.room?.hotel;
    const checkInDate = new Date(bookingResponse.checkInDate);
    const checkOutDate = new Date(bookingResponse.checkOutDate);
    const bookingDate = bookingResponse.createdAt
      ? new Date(bookingResponse.createdAt)
      : new Date();

    const isUpcoming =
      bookingResponse.status === "PENDING" ||
      bookingResponse.status === "CONFIRMED" ||
      bookingResponse.status === "CHECKED_IN";

    return {
      id: bookingResponse.id.toString(),
      bookingId: bookingResponse.bookingCode,
      bookingDate: bookingDate.toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      checkIn: checkInDate.toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      checkOut: checkOutDate.toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      hotelName: hotel?.name || "Unknown Hotel",
      location: hotel?.city
        ? `${hotel.city}, ${hotel.country || ""}`
        : hotel?.address || "",
      rating: hotel?.averageRating || 0,
      reviews: hotel?.reviewCount || 0,
      image: require("../../assets/images/anh1.jpg"), // Default image
      isUpcoming,
    };
  };

  const loadBookings = async () => {
    try {
      setLoading(true);
      setError(null);

      const userId = await AsyncStorage.getItem("userId");
      if (!userId) {
        setError("Vui lòng đăng nhập để xem bookings");
        setLoading(false);
        return;
      }

      if (selectedTab === "upcoming") {
        const upcomingData = await getUpcomingBookings();
        const converted = upcomingData.map(convertBookingResponseToBooking);
        setUpcomingBookings(converted);
      } else {
        const allBookings = await getAllUserBookings(Number(userId));
        const past = allBookings
          .filter(
            (b) =>
              b.status === "CHECKED_OUT" ||
              b.status === "CANCELLED" ||
              b.status === "NO_SHOW"
          )
          .map(convertBookingResponseToBooking);
        setPastBookings(past);
      }
    } catch (err: any) {
      console.error("Error loading bookings:", err);
      setError(err.message || "Không thể tải danh sách bookings");
      Alert.alert("Lỗi", err.message || "Không thể tải danh sách bookings");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    try {
      Alert.alert(
        "Xác nhận",
        "Bạn có chắc chắn muốn hủy booking này?",
        [
          { text: "Hủy", style: "cancel" },
          {
            text: "Xác nhận",
            onPress: async () => {
              try {
                await cancelBooking(Number(bookingId));
                Alert.alert("Thành công", "Booking đã được hủy");
                loadBookings();
              } catch (err: any) {
                Alert.alert("Lỗi", err.message || "Không thể hủy booking");
              }
            },
          },
        ]
      );
    } catch (err: any) {
      Alert.alert("Lỗi", err.message || "Không thể hủy booking");
    }
  };


  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i < Math.floor(rating) ? "star" : "star-outline"}
          size={14}
          color="#FFB800"
        />
      );
    }
    return stars;
  };

  const renderBookingCard = (booking: Booking) => (
    <View key={booking.id} style={styles.bookingCard}>
      <View style={styles.bookingHeader}>
        <Text style={styles.bookingId}>Booking ID: {booking.bookingId}</Text>
        <Text style={styles.bookingDate}>
          Booking Date: {booking.bookingDate}, {booking.checkIn} -{" "}
          {booking.checkOut}
        </Text>
      </View>

      <View style={styles.bookingContent}>
        <Image source={booking.image} style={styles.hotelImage} />
        <View style={styles.hotelInfo}>
          <View style={styles.ratingRow}>
            <View style={styles.starsContainer}>
              {renderStars(booking.rating)}
            </View>
            <Text style={styles.ratingText}>
              {booking.rating} ({booking.reviews} Reviews)
            </Text>
          </View>
          <Text style={styles.hotelName}>{booking.hotelName}</Text>
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={14} color="#6B7280" />
            <Text style={styles.locationText}>{booking.location}</Text>
          </View>
        </View>
      </View>

      <View style={styles.bookingActions}>
        {booking.isUpcoming ? (
          <>
            <TouchableOpacity
              style={styles.cancelButton}
              activeOpacity={0.8}
              onPress={() => handleCancelBooking(booking.id)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.viewDetailsButton}
              activeOpacity={0.8}
              onPress={() => {
                router.push({
                  pathname: "/hotel-detail",
                  params: { hotelId: booking.id },
                } as any);
              }}
            >
              <Text style={styles.viewDetailsButtonText}>View Details</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity
              style={styles.cancelButton}
              activeOpacity={0.8}
              onPress={() => {
                router.push({
                  pathname: "/reviews",
                  params: { hotelId: booking.id },
                } as any);
              }}
            >
              <Text style={styles.cancelButtonText}>Write a Review</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.viewDetailsButton}
              activeOpacity={0.8}
              onPress={() => {
                router.push({
                  pathname: "/hotel-detail",
                  params: { hotelId: booking.id },
                } as any);
              }}
            >
              <Text style={styles.viewDetailsButtonText}>Book Again</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );

  const bookings = selectedTab === "upcoming" ? upcomingBookings : pastBookings;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Bookings</Text>
      </View>

      {/* Segmented Control */}
      <View style={styles.segmentedControl}>
        <TouchableOpacity
          style={[
            styles.segment,
            selectedTab === "upcoming" && styles.segmentActive,
          ]}
          onPress={() => setSelectedTab("upcoming")}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.segmentText,
              selectedTab === "upcoming" && styles.segmentTextActive,
            ]}
          >
            Upcoming
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.segment,
            selectedTab === "past" && styles.segmentActive,
          ]}
          onPress={() => setSelectedTab("past")}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.segmentText,
              selectedTab === "past" && styles.segmentTextActive,
            ]}
          >
            Past
          </Text>
        </TouchableOpacity>
      </View>

      {/* Bookings List */}
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
            onPress={loadBookings}
          >
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {bookings.length > 0 ? (
            bookings.map((booking) => renderBookingCard(booking))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={64} color="#D1D5DB" />
              <Text style={styles.emptyStateText}>
                Không có {selectedTab === "upcoming" ? "booking sắp tới" : "booking đã qua"}
              </Text>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    padding: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
  },
  segmentedControl: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    padding: 4,
  },
  segment: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
  },
  segmentActive: {
    backgroundColor: "#4F46E5",
  },
  segmentText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4F46E5",
  },
  segmentTextActive: {
    color: "#FFFFFF",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 0,
    gap: 20,
  },
  bookingCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  bookingHeader: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  bookingId: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  bookingDate: {
    fontSize: 12,
    color: "#6B7280",
  },
  bookingContent: {
    flexDirection: "row",
    marginBottom: 16,
  },
  hotelImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
    marginRight: 16,
  },
  hotelInfo: {
    flex: 1,
  },
  ratingRow: {
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
    fontWeight: "500",
    color: "#111827",
  },
  hotelName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  locationText: {
    fontSize: 14,
    color: "#6B7280",
  },
  bookingActions: {
    flexDirection: "row",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#4F46E5",
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4F46E5",
  },
  viewDetailsButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#4F46E5",
    alignItems: "center",
    justifyContent: "center",
  },
  viewDetailsButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 64,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#6B7280",
    marginTop: 16,
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
