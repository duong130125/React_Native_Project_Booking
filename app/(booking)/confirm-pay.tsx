import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
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
import { createBooking } from "../../apis/booking";
import { getHotelById } from "../../apis/hotel";
import { getMyCards, payBooking } from "../../apis/payment";
import { getRoomById } from "../../apis/room";
import ErrorNotification from "../../components/ErrorNotification";
import SuccessNotification from "../../components/SuccessNotification";
import { HotelResponse, RoomResponse } from "../../types/hotel";
import { PaymentCardResponse } from "../../types/payment";

export default function ConfirmPayScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [room, setRoom] = useState<RoomResponse | null>(null);
  const [hotel, setHotel] = useState<HotelResponse | null>(null);
  const [paymentCards, setPaymentCards] = useState<PaymentCardResponse[]>([]);
  const [selectedCard, setSelectedCard] = useState<PaymentCardResponse | null>(
    null
  );
  const [paymentMethod, setPaymentMethod] = useState("full");
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [showErrorNotification, setShowErrorNotification] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showCvvModal, setShowCvvModal] = useState(false);
  const [cvv, setCvv] = useState("");
  const [cvvError, setCvvError] = useState("");

  const roomId = params.roomId ? parseInt(params.roomId as string) : null;
  const hotelId = params.hotelId ? parseInt(params.hotelId as string) : null;
  const [adults, setAdults] = useState(
    params.adults ? parseInt(params.adults as string) : 2
  );
  const [children, setChildren] = useState(
    params.children ? parseInt(params.children as string) : 0
  );
  const [infants, setInfants] = useState(
    params.infants ? parseInt(params.infants as string) : 0
  );
  const [startDate, setStartDate] = useState(params.startDate as string);
  const [endDate, setEndDate] = useState(params.endDate as string);

  useEffect(() => {
    loadData();
  }, []);

  // Refresh cards and update params when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      const refreshData = async () => {
        try {
          // Update dates and guests from params if changed
          if (params.startDate && params.startDate !== startDate) {
            setStartDate(params.startDate as string);
          }
          if (params.endDate && params.endDate !== endDate) {
            setEndDate(params.endDate as string);
          }
          if (params.adults) {
            setAdults(parseInt(params.adults as string));
          }
          if (params.children) {
            setChildren(parseInt(params.children as string));
          }
          if (params.infants) {
            setInfants(parseInt(params.infants as string));
          }

          // Refresh cards
          const cardsData = await getMyCards();
          setPaymentCards(cardsData);

          // Set default card if available
          const defaultCard = cardsData.find((card) => card.isDefault);
          if (defaultCard) {
            setSelectedCard(defaultCard);
          } else if (cardsData.length > 0 && !selectedCard) {
            setSelectedCard(cardsData[0]);
          }
        } catch (error) {
          console.error("Error refreshing data:", error);
        }
      };

      // Only refresh if we already have room data loaded
      if (room) {
        refreshData();
      }
    }, [
      room,
      selectedCard,
      params.startDate,
      params.endDate,
      params.adults,
      params.children,
      params.infants,
    ])
  );

  const loadData = async () => {
    if (!roomId) {
      setErrorMessage("Thiếu thông tin phòng");
      setShowErrorNotification(true);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const roomData = await getRoomById(roomId);
      setRoom(roomData);

      // Load hotel data if not available in room or if hotelId is provided
      const hotelId = params.hotelId
        ? parseInt(params.hotelId as string)
        : roomData.hotel?.id;
      if (hotelId) {
        try {
          const hotelData = await getHotelById(hotelId);
          setHotel(hotelData);
        } catch (error) {
          console.error("Error loading hotel:", error);
          // Use hotel from room if API fails
          if (roomData.hotel) {
            setHotel(roomData.hotel);
          }
        }
      } else if (roomData.hotel) {
        setHotel(roomData.hotel);
      }

      // Load payment cards
      const cardsData = await getMyCards();
      setPaymentCards(cardsData);

      // Set default card if available
      const defaultCard = cardsData.find((card) => card.isDefault);
      if (defaultCard) {
        setSelectedCard(defaultCard);
      } else if (cardsData.length > 0) {
        setSelectedCard(cardsData[0]);
      }
    } catch (error: any) {
      console.error("Error loading data:", error);
      setErrorMessage(
        error.response?.data?.message ||
          error.message ||
          "Không thể tải dữ liệu. Vui lòng thử lại."
      );
      setShowErrorNotification(true);
    } finally {
      setLoading(false);
    }
  };

  const calculateNights = () => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const calculatePrice = () => {
    if (!room) return { subtotal: 0, discount: 0, taxes: 0, total: 0 };

    const nights = calculateNights();
    const pricePerNight = room.discountPrice || room.price;
    const subtotal = pricePerNight * nights;

    // Calculate discount if original price > discount price
    const originalTotal = room.price * nights;
    const discount = originalTotal - subtotal;

    // Taxes: 10% of subtotal
    const taxes = subtotal * 0.1;
    const total = subtotal + taxes;

    return { subtotal, discount, taxes, total, nights };
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
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

  const handlePayNow = () => {
    if (!room || !roomId || !startDate || !endDate) {
      setErrorMessage("Thiếu thông tin đặt phòng");
      setShowErrorNotification(true);
      return;
    }

    if (!selectedCard) {
      router.push("/add-new-card" as any);
      return;
    }

    // Check card balance before showing CVV modal
    const { total } = calculatePrice();
    const cardBalance = parseFloat(selectedCard.balance || "0");
    
    if (cardBalance < total) {
      const shortfall = total - cardBalance;
      setErrorMessage(
        `Số dư không đủ để thanh toán. Số tiền cần: ${formatPrice(total)}, ` +
        `Số dư hiện tại: ${formatPrice(cardBalance)}, ` +
        `Thiếu: ${formatPrice(shortfall)}`
      );
      setShowErrorNotification(true);
      return;
    }

    // Show CVV modal
    setShowCvvModal(true);
    setCvv("");
    setCvvError("");
  };

  const handleConfirmPayment = async () => {
    if (!selectedCard) {
      setCvvError("Thẻ thanh toán không hợp lệ");
      return;
    }

    // Validate CVV
    if (!cvv || cvv.trim() === "") {
      setCvvError("Vui lòng nhập CVV");
      return;
    }

    if (cvv.length < 3 || cvv.length > 4) {
      setCvvError("CVV phải có 3-4 chữ số");
      return;
    }

    if (!/^\d+$/.test(cvv)) {
      setCvvError("CVV chỉ được chứa số");
      return;
    }

    if (!roomId) {
      setCvvError("Thiếu thông tin phòng");
      return;
    }

    try {
      setProcessing(true);
      setShowCvvModal(false);
      setErrorMessage("");

      // Create booking
      const totalGuests = adults + children;

      // Ensure dates are in YYYY-MM-DD format (LocalDate format, not ISO with timezone)
      const formatDateForAPI = (dateString: string) => {
        // If already in YYYY-MM-DD format, return as is
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
          return dateString;
        }
        // Otherwise, parse and format
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      };

      const booking = await createBooking({
        roomId: roomId,
        checkInDate: formatDateForAPI(startDate),
        checkOutDate: formatDateForAPI(endDate),
        guests: totalGuests,
      });

      // Process payment
      const { total } = calculatePrice();

      // Format expiry date as MM/YY
      const expiryDate = `${selectedCard.expMonth
        .toString()
        .padStart(2, "0")}/${selectedCard.expYear.toString().slice(-2)}`;

      // Extract last 4 digits from masked card number
      // Backend will match card by last 4 digits since we only store masked number
      let cardNumber = selectedCard.cardNumber;

      // If card number is masked (**** **** **** 1234), extract last 4 digits
      // Backend will find the card by matching last 4 digits
      if (cardNumber.includes("*")) {
        // Extract last 4 digits from masked format
        const lastFour = cardNumber
          .replace(/\*/g, "")
          .replace(/\s/g, "")
          .slice(-4);
        // Send as full format (16 digits) for validation - backend will extract last 4
        // Format: 0000 0000 0000 1234 (16 digits total, last 4 from masked card)
        cardNumber = `0000 0000 0000 ${lastFour}`;
      } else {
        // If not masked, ensure it's in correct format (remove spaces if any)
        cardNumber = cardNumber.replace(/\s/g, "");
      }

      await payBooking({
        bookingId: booking.id,
        paymentMethod: "CREDIT_CARD",
        cardNumber: cardNumber,
        cardHolderName: selectedCard.cardHolderName,
        expiryDate: expiryDate,
        cvv: cvv.trim(),
      });

      setShowSuccessNotification(true);

      // Navigate to payment success screen after 2 seconds
      setTimeout(() => {
        router.replace({
          pathname: "/payment-done",
          params: {
            bookingId: booking.id.toString(),
            bookingCode: booking.bookingCode,
          },
        } as any);
      }, 2000);
    } catch (error: any) {
      console.error("Error processing payment:", error);
      
      // Extract error message from response
      let errorMsg = "Không thể xử lý thanh toán. Vui lòng thử lại.";
      
      if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      } else if (error.response?.data?.data?.message) {
        errorMsg = error.response.data.data.message;
      } else if (error.message) {
        errorMsg = error.message;
      }
      
      // Check if it's an insufficient balance error
      if (errorMsg.includes("Số dư không đủ") || errorMsg.includes("Insufficient balance")) {
        setErrorMessage(errorMsg);
      } else {
        setErrorMessage(errorMsg);
      }
      
      setShowErrorNotification(true);
    } finally {
      setProcessing(false);
      setCvv("");
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <StatusBar style="dark" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!room) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <StatusBar style="dark" />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
          <Text style={styles.errorText}>Không tìm thấy thông tin phòng</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Quay lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const displayHotel = hotel || room.hotel;
  const { subtotal, discount, taxes, total, nights } = calculatePrice();
  const primaryImage =
    room.images?.find((img) => img.isPrimary) || room.images?.[0];
  const hotelPrimaryImage =
    displayHotel?.images?.find((img) => img.isPrimary) ||
    displayHotel?.images?.[0];
  const imageUrl =
    primaryImage?.imageUrl ||
    hotelPrimaryImage?.imageUrl ||
    displayHotel?.imageUrl;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Xác nhận & Thanh toán</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hotel Information Card */}
        <View style={styles.hotelCard}>
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={styles.hotelImage} />
          ) : (
            <View style={[styles.hotelImage, styles.placeholderImage]}>
              <Ionicons name="image-outline" size={40} color="#9CA3AF" />
            </View>
          )}
          <View style={styles.hotelInfo}>
            {displayHotel?.averageRating && (
              <View style={styles.ratingRow}>
                <View style={styles.starsContainer}>
                  {renderStars(displayHotel.averageRating)}
                </View>
                <Text style={styles.ratingText}>
                  {displayHotel.averageRating.toFixed(1)} (
                  {displayHotel.reviewCount || 0} đánh giá)
                </Text>
              </View>
            )}
            <Text style={styles.hotelName}>
              {displayHotel?.name || "Khách sạn"}
            </Text>
            {displayHotel?.address && (
              <View style={styles.locationRow}>
                <Ionicons name="location-outline" size={14} color="#6B7280" />
                <Text style={styles.locationText}>
                  {displayHotel.address}
                  {displayHotel.city && `, ${displayHotel.city}`}
                </Text>
              </View>
            )}
            <Text style={styles.guestsText}>
              {adults} người lớn {children > 0 ? `| ${children} trẻ em` : ""}{" "}
              {infants > 0 ? `| ${infants} trẻ sơ sinh` : ""}
            </Text>
          </View>
        </View>

        {/* Your Booking Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chi tiết đặt phòng</Text>

          <View style={styles.detailRow}>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Ngày nhận/phòng</Text>
              <Text style={styles.detailValue}>
                {formatDate(startDate)} - {formatDate(endDate)}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                router.push({
                  pathname: "/select-date",
                  params: {
                    roomId: roomId?.toString(),
                    hotelId: params.hotelId as string,
                    startDate: startDate,
                    endDate: endDate,
                  },
                } as any);
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="create-outline" size={20} color="#4F46E5" />
            </TouchableOpacity>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Số đêm</Text>
              <Text style={styles.detailValue}>{nights} đêm</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Khách</Text>
              <Text style={styles.detailValue}>
                {adults} người lớn {children > 0 ? `, ${children} trẻ em` : ""}{" "}
                {infants > 0 ? `, ${infants} trẻ sơ sinh` : ""}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                router.push({
                  pathname: "/select-guest",
                  params: {
                    roomId: roomId?.toString(),
                    hotelId: params.hotelId as string,
                    startDate: startDate,
                    endDate: endDate,
                    adults: adults.toString(),
                    children: children.toString(),
                    infants: infants.toString(),
                  },
                } as any);
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="create-outline" size={20} color="#4F46E5" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Choose how to pay */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chọn phương thức thanh toán</Text>

          <TouchableOpacity
            style={styles.paymentOption}
            onPress={() => setPaymentMethod("full")}
            activeOpacity={0.7}
          >
            <View style={styles.paymentOptionContent}>
              <Text style={styles.paymentOptionTitle}>Thanh toán toàn bộ</Text>
              <Text style={styles.paymentOptionSubtitle}>
                Thanh toán toàn bộ ngay bây giờ.
              </Text>
            </View>
            <View style={styles.radioButton}>
              {paymentMethod === "full" && (
                <View style={styles.radioButtonInner} />
              )}
            </View>
          </TouchableOpacity>
        </View>

        {/* Pay with */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Thanh toán bằng</Text>
            <TouchableOpacity
              onPress={() => router.push("/add-new-card" as any)}
              activeOpacity={0.7}
            >
              <Text style={styles.addButtonText}>Thêm</Text>
            </TouchableOpacity>
          </View>

          {paymentCards.length === 0 ? (
            <TouchableOpacity
              style={styles.addCardButton}
              onPress={() => router.push("/add-new-card" as any)}
              activeOpacity={0.7}
            >
              <Ionicons name="add-circle-outline" size={24} color="#4F46E5" />
              <Text style={styles.addCardButtonText}>Thêm thẻ thanh toán</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.cardsContainer}>
              {paymentCards.map((card) => (
                <TouchableOpacity
                  key={card.id}
                  style={[
                    styles.cardItem,
                    selectedCard?.id === card.id && styles.cardItemSelected,
                  ]}
                  onPress={() => setSelectedCard(card)}
                  activeOpacity={0.7}
                >
                  <View style={styles.cardInfo}>
                    <Text style={styles.cardBrand}>{card.cardBrand}</Text>
                    <Text style={styles.cardNumber}>{card.cardNumber}</Text>
                    <Text style={styles.cardExpiry}>
                      {card.expMonth.toString().padStart(2, "0")}/
                      {card.expYear.toString().slice(-2)}
                    </Text>
                  </View>
                  <View style={styles.radioButton}>
                    {selectedCard?.id === card.id && (
                      <View style={styles.radioButtonInner} />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Price Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chi tiết giá</Text>

          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>
              {formatPrice(room.discountPrice || room.price)} x {nights} đêm
            </Text>
            <Text style={styles.priceValue}>{formatPrice(subtotal)}</Text>
          </View>

          {discount > 0 && (
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Giảm giá</Text>
              <Text style={[styles.priceValue, styles.discountText]}>
                -{formatPrice(discount)}
              </Text>
            </View>
          )}

          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Thuế và phí</Text>
            <Text style={styles.priceValue}>{formatPrice(taxes)}</Text>
          </View>

          <View style={[styles.priceRow, styles.grandTotalRow]}>
            <Text style={styles.grandTotalLabel}>Tổng cộng</Text>
            <Text style={styles.grandTotalValue}>{formatPrice(total)}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Pay Now Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[
            styles.payNowButton,
            processing && styles.payNowButtonDisabled,
          ]}
          onPress={handlePayNow}
          disabled={processing}
          activeOpacity={0.8}
        >
          {processing ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.payNowButtonText}>
              Thanh toán {formatPrice(total)}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Success Notification */}
      {showSuccessNotification && (
        <SuccessNotification
          message="Thanh toán thành công!"
          onClose={() => setShowSuccessNotification(false)}
          autoHide={true}
          duration={2000}
        />
      )}

      {/* Error Notification */}
      {showErrorNotification && (
        <ErrorNotification
          message={errorMessage}
          onClose={() => setShowErrorNotification(false)}
          autoHide={true}
          duration={4000}
        />
      )}

      {/* CVV Modal */}
      <Modal
        visible={showCvvModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => {
          setShowCvvModal(false);
          setCvv("");
          setCvvError("");
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Nhập CVV</Text>
            <Text style={styles.modalSubtitle}>
              Vui lòng nhập mã CVV của thẻ {selectedCard?.cardBrand} ending in{" "}
              {selectedCard?.cardNumber.slice(-4)}
            </Text>

            <View style={styles.cvvInputContainer}>
              <Text style={styles.cvvLabel}>CVV</Text>
              <TextInput
                style={[styles.cvvInput, cvvError && styles.cvvInputError]}
                value={cvv}
                onChangeText={(text) => {
                  const cleaned = text.replace(/\D/g, "").slice(0, 4);
                  setCvv(cleaned);
                  if (cvvError) {
                    setCvvError("");
                  }
                }}
                placeholder="***"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                secureTextEntry
                maxLength={4}
                autoFocus
              />
              {cvvError && <Text style={styles.cvvErrorText}>{cvvError}</Text>}
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => {
                  setShowCvvModal(false);
                  setCvv("");
                  setCvvError("");
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.modalButtonCancelText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.modalButtonConfirm,
                  (!cvv || cvv.length < 3 || processing) &&
                    styles.modalButtonDisabled,
                ]}
                onPress={handleConfirmPayment}
                disabled={!cvv || cvv.length < 3 || processing}
                activeOpacity={0.7}
              >
                {processing ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.modalButtonConfirmText}>Xác nhận</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
    color: "#6B7280",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    gap: 16,
  },
  errorText: {
    fontSize: 16,
    color: "#EF4444",
    textAlign: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  hotelCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  hotelImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
    marginRight: 16,
  },
  placeholderImage: {
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
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
    marginBottom: 8,
    gap: 4,
  },
  locationText: {
    fontSize: 14,
    color: "#6B7280",
    flex: 1,
  },
  guestsText: {
    fontSize: 14,
    color: "#6B7280",
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  paymentOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  paymentOptionContent: {
    flex: 1,
  },
  paymentOptionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  paymentOptionSubtitle: {
    fontSize: 14,
    color: "#6B7280",
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#4F46E5",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 16,
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#4F46E5",
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4F46E5",
  },
  addCardButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderWidth: 2,
    borderColor: "#4F46E5",
    borderStyle: "dashed",
    borderRadius: 12,
    gap: 8,
  },
  addCardButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4F46E5",
  },
  cardsContainer: {
    gap: 12,
  },
  cardItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    backgroundColor: "#F9FAFB",
  },
  cardItemSelected: {
    borderColor: "#4F46E5",
    backgroundColor: "#EEF2FF",
  },
  cardInfo: {
    flex: 1,
  },
  cardBrand: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  cardNumber: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 4,
  },
  cardExpiry: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  priceLabel: {
    fontSize: 16,
    color: "#6B7280",
  },
  priceValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  discountText: {
    color: "#4F46E5",
  },
  grandTotalRow: {
    borderBottomWidth: 0,
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  grandTotalLabel: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  grandTotalValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 34,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  payNowButton: {
    backgroundColor: "#4F46E5",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  payNowButtonDisabled: {
    opacity: 0.6,
  },
  payNowButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4F46E5",
    marginTop: 8,
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
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 24,
    lineHeight: 20,
  },
  cvvInputContainer: {
    marginBottom: 24,
  },
  cvvLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 8,
  },
  cvvInput: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    backgroundColor: "#F9FAFB",
    letterSpacing: 4,
  },
  cvvInputError: {
    borderColor: "#EF4444",
    backgroundColor: "#FEF2F2",
  },
  cvvErrorText: {
    fontSize: 12,
    color: "#EF4444",
    marginTop: 4,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  modalButtonCancel: {
    backgroundColor: "#F3F4F6",
  },
  modalButtonCancelText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  modalButtonConfirm: {
    backgroundColor: "#4F46E5",
  },
  modalButtonDisabled: {
    opacity: 0.5,
  },
  modalButtonConfirmText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
