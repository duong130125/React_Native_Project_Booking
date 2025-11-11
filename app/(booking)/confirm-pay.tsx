import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ConfirmPayScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [paymentMethod, setPaymentMethod] = useState("full");
  const [selectedCard, setSelectedCard] = useState<string | null>(null);

  const hotel = {
    name: "Malon Greens",
    location: "Mumbai, Maharashtra",
    rating: 4.0,
    reviews: 115,
    image: require("../../assets/images/anh4.jpg"),
    guests: `${params.adults || 2} adults | ${params.children || 1} children`,
  };

  const pricePerNight = 120;
  const nights = 3;
  const subtotal = pricePerNight * nights;
  const discount = 50;
  const taxes = 10;
  const grandTotal = subtotal - discount + taxes;

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "May 06, 2023";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
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
    if (!selectedCard) {
      router.push("/add-new-card" as any);
    } else {
      // Process payment
      router.push("/payment-done" as any);
    }
  };

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
        <Text style={styles.headerTitle}>Confirm & Pay</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hotel Information Card */}
        <View style={styles.hotelCard}>
          <Image source={hotel.image} style={styles.hotelImage} />
          <View style={styles.hotelInfo}>
            <View style={styles.ratingRow}>
              <View style={styles.starsContainer}>
                {renderStars(hotel.rating)}
              </View>
              <Text style={styles.ratingText}>
                {hotel.rating} ({hotel.reviews} Reviews)
              </Text>
            </View>
            <Text style={styles.hotelName}>{hotel.name}</Text>
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={14} color="#6B7280" />
              <Text style={styles.locationText}>{hotel.location}</Text>
            </View>
            <Text style={styles.guestsText}>{hotel.guests}</Text>
          </View>
        </View>

        {/* Your Booking Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Booking Details</Text>

          <View style={styles.detailRow}>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Dates</Text>
              <Text style={styles.detailValue}>
                {formatDate(params.startDate as string)} -{" "}
                {formatDate(params.endDate as string)}
              </Text>
            </View>
            <TouchableOpacity>
              <Ionicons name="create-outline" size={20} color="#4F46E5" />
            </TouchableOpacity>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Guests</Text>
              <Text style={styles.detailValue}>{hotel.guests}</Text>
            </View>
            <TouchableOpacity>
              <Ionicons name="create-outline" size={20} color="#4F46E5" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Choose how to pay */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Choose how to pay</Text>

          <TouchableOpacity
            style={styles.paymentOption}
            onPress={() => setPaymentMethod("full")}
            activeOpacity={0.7}
          >
            <View style={styles.paymentOptionContent}>
              <Text style={styles.paymentOptionTitle}>Pay in full</Text>
              <Text style={styles.paymentOptionSubtitle}>
                Pay the total now and you're all set.
              </Text>
            </View>
            <View style={styles.radioButton}>
              {paymentMethod === "full" && (
                <View style={styles.radioButtonInner} />
              )}
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.paymentOption}
            onPress={() => setPaymentMethod("partial")}
            activeOpacity={0.7}
          >
            <View style={styles.paymentOptionContent}>
              <Text style={styles.paymentOptionTitle}>
                Pay part now, part later
              </Text>
              <Text style={styles.paymentOptionSubtitle}>
                Pay part now and you're all set.
              </Text>
            </View>
            <View style={styles.radioButton}>
              {paymentMethod === "partial" && (
                <View style={styles.radioButtonInner} />
              )}
            </View>
          </TouchableOpacity>
        </View>

        {/* Pay with */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Pay with</Text>
            <TouchableOpacity
              onPress={() => router.push("/add-new-card" as any)}
              activeOpacity={0.7}
            >
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.paymentMethodRow}>
            <Text style={styles.paymentMethodText}>Payment method</Text>
            <View style={styles.paymentIcons}>
              <View style={styles.paymentIcon}>
                <Text style={styles.paymentIconText}>VISA</Text>
              </View>
              <View style={styles.paymentIcon}>
                <Text style={styles.paymentIconText}>MC</Text>
              </View>
              <View style={styles.paymentIcon}>
                <Ionicons name="logo-apple" size={20} color="#000000" />
              </View>
              <View style={styles.paymentIcon}>
                <Ionicons name="logo-google" size={20} color="#4285F4" />
              </View>
            </View>
          </View>
        </View>

        {/* Price Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Price Details</Text>

          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>
              ${pricePerNight} x {nights} nights
            </Text>
            <Text style={styles.priceValue}>${subtotal.toFixed(2)}</Text>
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Discount</Text>
            <Text style={[styles.priceValue, styles.discountText]}>
              -${discount.toFixed(2)}
            </Text>
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Occupancy taxes and fees</Text>
            <Text style={styles.priceValue}>${taxes.toFixed(2)}</Text>
          </View>

          <View style={[styles.priceRow, styles.grandTotalRow]}>
            <Text style={styles.grandTotalLabel}>Grand Total</Text>
            <Text style={styles.grandTotalValue}>${grandTotal.toFixed(2)}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Pay Now Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.payNowButton}
          onPress={handlePayNow}
          activeOpacity={0.8}
        >
          <Text style={styles.payNowButtonText}>Pay Now</Text>
        </TouchableOpacity>
      </View>
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
  paymentMethodRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
  },
  paymentMethodText: {
    fontSize: 16,
    color: "#111827",
  },
  paymentIcons: {
    flexDirection: "row",
    gap: 8,
  },
  paymentIcon: {
    width: 32,
    height: 20,
    borderRadius: 4,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  paymentIconText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#111827",
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4F46E5",
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
  payNowButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
