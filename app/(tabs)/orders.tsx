import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
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
import {
  cancelBooking,
  getAllUserBookings,
  getUpcomingBookings,
} from "../../apis/booking";
import { Colors } from "../../constants/colors";
import { Spacing } from "../../constants/spacing";
import { Typography } from "../../constants/typography";
import { Booking, BookingResponse } from "../../types/hotel";

export default function OrdersScreen() {
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState<"upcoming" | "past">(
    "upcoming"
  );
  const [upcomingBookings, setUpcomingBookings] = useState<Booking[]>([]);
  const [pastBookings, setPastBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(
    null
  );
  const [cancellationReason, setCancellationReason] = useState("");
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    loadBookings();
  }, []);

  useEffect(() => {
    loadBookings();
  }, [selectedTab]);

  const convertBookingResponseToBooking = (
    bookingResponse: BookingResponse
  ): Booking & {
    originalResponse: BookingResponse;
    hotelImageUrl?: string;
    status: string;
    totalPrice: number;
    nights: number;
  } => {
    const hotel = bookingResponse.room?.hotel;
    const checkInDate = new Date(bookingResponse.checkInDate);
    const checkOutDate = new Date(bookingResponse.checkOutDate);
    const bookingDate = bookingResponse.createdAt
      ? new Date(bookingResponse.createdAt)
      : new Date();

    // Calculate nights
    const nights = Math.ceil(
      (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    const isUpcoming =
      bookingResponse.status === "PENDING" ||
      bookingResponse.status === "CONFIRMED" ||
      bookingResponse.status === "CHECKED_IN";

    // Get hotel image
    const hotelImage =
      hotel?.images?.find((img) => img.isPrimary) || hotel?.images?.[0];
    const hotelImageUrl = hotelImage?.imageUrl || hotel?.imageUrl;

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
        ? `${hotel.city}${hotel.country ? `, ${hotel.country}` : ""}`
        : hotel?.address || "",
      rating: hotel?.averageRating || 0,
      reviews: hotel?.reviewCount || 0,
      image: require("../../assets/images/anh1.jpg"), // Fallback image
      isUpcoming,
      // Additional fields
      originalResponse: bookingResponse,
      hotelImageUrl: hotelImageUrl,
      status: bookingResponse.status,
      totalPrice: bookingResponse.totalPrice || 0,
      nights: nights,
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

  const handleCancelBooking = (bookingId: string) => {
    setSelectedBookingId(bookingId);
    setCancellationReason("");
    setShowCancelModal(true);
  };

  const handleConfirmCancel = async () => {
    if (!selectedBookingId) return;

    if (!cancellationReason.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập lý do hủy");
      return;
    }

    try {
      setCancelling(true);
      await cancelBooking(Number(selectedBookingId), cancellationReason.trim());
      Alert.alert(
        "Thành công",
        "Booking đã được hủy. Tiền đã được hoàn lại vào thẻ thanh toán."
      );
      setShowCancelModal(false);
      setCancellationReason("");
      setSelectedBookingId(null);
      loadBookings();
    } catch (err: any) {
      Alert.alert(
        "Lỗi",
        err.response?.data?.message || err.message || "Không thể hủy booking"
      );
    } finally {
      setCancelling(false);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "#F59E0B"; // Amber
      case "CONFIRMED":
        return "#10B981"; // Green
      case "CHECKED_IN":
        return "#3B82F6"; // Blue
      case "CHECKED_OUT":
        return "#6B7280"; // Gray
      case "CANCELLED":
        return "#EF4444"; // Red
      case "NO_SHOW":
        return "#9CA3AF"; // Light gray
      default:
        return "#6B7280";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "PENDING":
        return "Chờ xác nhận";
      case "CONFIRMED":
        return "Đã xác nhận";
      case "CHECKED_IN":
        return "Đã check-in";
      case "CHECKED_OUT":
        return "Đã check-out";
      case "CANCELLED":
        return "Đã hủy";
      case "NO_SHOW":
        return "Không đến";
      default:
        return status;
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const renderBookingCard = (
    booking: Booking & {
      originalResponse?: BookingResponse;
      hotelImageUrl?: string;
      status?: string;
      totalPrice?: number;
      nights?: number;
    }
  ) => {
    const hotelId = booking.originalResponse?.room?.hotel?.id;
    const roomId = booking.originalResponse?.room?.id;
    const guests = booking.originalResponse?.guests || 0;

    return (
      <View key={booking.id} style={styles.bookingCard}>
        {/* Status Badge */}
        {booking.status && (
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(booking.status) + "15" },
            ]}
          >
            <View
              style={[
                styles.statusDot,
                { backgroundColor: getStatusColor(booking.status) },
              ]}
            />
            <Text
              style={[
                styles.statusText,
                { color: getStatusColor(booking.status) },
              ]}
            >
              {getStatusText(booking.status)}
            </Text>
          </View>
        )}

        {/* Booking Header */}
        <View style={styles.bookingHeader}>
          <View style={styles.bookingIdRow}>
            <Text style={styles.bookingIdLabel}>Mã đặt phòng:</Text>
            <Text style={styles.bookingId}>{booking.bookingId}</Text>
          </View>
          <Text style={styles.bookingDate}>
            Đặt ngày: {booking.bookingDate}
          </Text>
        </View>

        {/* Hotel Content */}
        <View style={styles.bookingContent}>
          {booking.hotelImageUrl ? (
            <Image
              source={{ uri: booking.hotelImageUrl }}
              style={styles.hotelImage}
              defaultSource={require("../../assets/images/anh1.jpg")}
            />
          ) : (
            <Image source={booking.image} style={styles.hotelImage} />
          )}
          <View style={styles.hotelInfo}>
            {booking.rating > 0 && (
              <View style={styles.ratingRow}>
                <View style={styles.starsContainer}>
                  {renderStars(booking.rating)}
                </View>
                <Text style={styles.ratingText}>
                  {booking.rating.toFixed(1)} ({booking.reviews} đánh giá)
                </Text>
              </View>
            )}
            <Text style={styles.hotelName} numberOfLines={2}>
              {booking.hotelName}
            </Text>
            {booking.location && (
              <View style={styles.locationRow}>
                <Ionicons name="location-outline" size={14} color="#6B7280" />
                <Text style={styles.locationText} numberOfLines={1}>
                  {booking.location}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Booking Details */}
        <View style={styles.bookingDetails}>
          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={16} color="#6B7280" />
            <Text style={styles.detailText}>
              {booking.checkIn} → {booking.checkOut}
            </Text>
          </View>
          {booking.nights && booking.nights > 0 && (
            <View style={styles.detailRow}>
              <Ionicons name="moon-outline" size={16} color="#6B7280" />
              <Text style={styles.detailText}>{booking.nights} đêm</Text>
            </View>
          )}
          {guests > 0 && (
            <View style={styles.detailRow}>
              <Ionicons name="people-outline" size={16} color="#6B7280" />
              <Text style={styles.detailText}>{guests} khách</Text>
            </View>
          )}
          {booking.totalPrice && booking.totalPrice > 0 && (
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Tổng tiền:</Text>
              <Text style={styles.priceValue}>
                {formatPrice(booking.totalPrice)}
              </Text>
            </View>
          )}
        </View>

        {/* Actions */}
        <View style={styles.bookingActions}>
          {booking.isUpcoming ? (
            <>
              {booking.status !== "CANCELLED" && (
                <TouchableOpacity
                  style={styles.cancelButton}
                  activeOpacity={0.8}
                  onPress={() => handleCancelBooking(booking.id)}
                >
                  <Ionicons
                    name="close-circle-outline"
                    size={18}
                    color="#EF4444"
                  />
                  <Text style={styles.cancelButtonText}>Hủy đặt phòng</Text>
                </TouchableOpacity>
              )}
              {hotelId && (
                <TouchableOpacity
                  style={styles.viewDetailsButton}
                  activeOpacity={0.8}
                  onPress={() => {
                    router.push({
                      pathname: "/hotel-detail",
                      params: { hotelId: hotelId.toString() },
                    } as any);
                  }}
                >
                  <Ionicons name="eye-outline" size={18} color="#FFFFFF" />
                  <Text style={styles.viewDetailsButtonText}>Xem chi tiết</Text>
                </TouchableOpacity>
              )}
            </>
          ) : (
            <>
              {hotelId && (
                <>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    activeOpacity={0.8}
                    onPress={() => {
                      router.push({
                        pathname: "/reviews",
                        params: { hotelId: hotelId.toString() },
                      } as any);
                    }}
                  >
                    <Ionicons name="star-outline" size={18} color="#4F46E5" />
                    <Text style={styles.cancelButtonText}>Viết đánh giá</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.viewDetailsButton}
                    activeOpacity={0.8}
                    onPress={() => {
                      router.push({
                        pathname: "/hotel-detail",
                        params: { hotelId: hotelId.toString() },
                      } as any);
                    }}
                  >
                    <Ionicons name="repeat-outline" size={18} color="#FFFFFF" />
                    <Text style={styles.viewDetailsButtonText}>Đặt lại</Text>
                  </TouchableOpacity>
                </>
              )}
            </>
          )}
        </View>
      </View>
    );
  };

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
          <TouchableOpacity style={styles.retryButton} onPress={loadBookings}>
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
                {`Không có ${
                  selectedTab === "upcoming"
                    ? "booking sắp tới"
                    : "booking đã qua"
                }`}
              </Text>
            </View>
          )}
        </ScrollView>
      )}

      {/* Cancel Booking Modal */}
      <Modal
        visible={showCancelModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => {
          setShowCancelModal(false);
          setCancellationReason("");
          setSelectedBookingId(null);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Hủy đặt phòng</Text>
              <TouchableOpacity
                onPress={() => {
                  setShowCancelModal(false);
                  setCancellationReason("");
                  setSelectedBookingId(null);
                }}
                style={styles.closeModalButton}
              >
                <Ionicons name="close" size={24} color="#111827" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>
              Vui lòng nhập lý do hủy đặt phòng. Tiền sẽ được hoàn lại vào thẻ
              thanh toán.
            </Text>

            <View style={styles.reasonInputContainer}>
              <Text style={styles.reasonLabel}>Lý do hủy *</Text>
              <TextInput
                style={styles.reasonInput}
                placeholder="Nhập lý do hủy đặt phòng..."
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={4}
                value={cancellationReason}
                onChangeText={setCancellationReason}
                textAlignVertical="top"
                maxLength={500}
              />
              <Text style={styles.charCount}>
                {cancellationReason.length}/500
              </Text>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => {
                  setShowCancelModal(false);
                  setCancellationReason("");
                  setSelectedBookingId(null);
                }}
                disabled={cancelling}
                activeOpacity={0.7}
              >
                <Text style={styles.modalButtonCancelText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.modalButtonConfirm,
                  (!cancellationReason.trim() || cancelling) &&
                    styles.modalButtonDisabled,
                ]}
                onPress={handleConfirmCancel}
                disabled={!cancellationReason.trim() || cancelling}
                activeOpacity={0.7}
              >
                {cancelling ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.modalButtonConfirmText}>
                    Xác nhận hủy
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
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
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    marginBottom: 16,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 12,
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  bookingHeader: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  bookingIdRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
    gap: 8,
  },
  bookingIdLabel: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },
  bookingId: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
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
    width: 120,
    height: 120,
    borderRadius: 12,
    marginRight: 16,
    backgroundColor: "#F3F4F6",
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
    flex: 1,
  },
  bookingDetails: {
    marginTop: 16,
    marginBottom: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    gap: 10,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: "#111827",
    fontWeight: "500",
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  priceLabel: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  priceValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#4F46E5",
  },
  bookingActions: {
    flexDirection: "row",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#EF4444",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
    backgroundColor: "#FEF2F2",
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#EF4444",
  },
  viewDetailsButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "#4F46E5",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },
  closeModalButton: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 20,
    lineHeight: 20,
  },
  reasonInputContainer: {
    marginBottom: 24,
  },
  reasonLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 12,
  },
  reasonInput: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#111827",
    minHeight: 120,
    backgroundColor: "#F9FAFB",
    marginBottom: 8,
  },
  charCount: {
    fontSize: 12,
    color: "#9CA3AF",
    textAlign: "right",
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  modalButtonCancel: {
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
  },
  modalButtonCancelText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6B7280",
  },
  modalButtonConfirm: {
    backgroundColor: "#EF4444",
  },
  modalButtonDisabled: {
    backgroundColor: "#D1D5DB",
  },
  modalButtonConfirmText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
