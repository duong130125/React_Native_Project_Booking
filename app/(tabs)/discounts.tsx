import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import * as Clipboard from "expo-clipboard";
import { SafeAreaView } from "react-native-safe-area-context";
import { getAllHotels, getBestHotels } from "../../apis/hotel";
import { getRoomsByHotel } from "../../apis/room";
import { HotelCard } from "../../components/hotel/HotelCard";
import { Colors } from "../../constants/colors";
import { Spacing } from "../../constants/spacing";
import { Typography } from "../../constants/typography";
import { useFavorites } from "../../hooks/useFavorites";
import { HotelResponse, RoomResponse } from "../../types/hotel";
import { convertHotelResponsesToHotels } from "../../utils/hotelUtils";

interface DiscountedRoom {
  room: RoomResponse;
  hotel: HotelResponse;
  discountPercent: number;
}

interface PromoCode {
  id: string;
  code: string;
  title: string;
  description: string;
  discount: number;
  type: "percentage" | "fixed";
  validUntil: string;
}

export default function DiscountsScreen() {
  const router = useRouter();
  const { favorites, toggleFavorite, isFavorite } = useFavorites();
  const [loading, setLoading] = useState(true);
  const [discountedRooms, setDiscountedRooms] = useState<DiscountedRoom[]>([]);
  const [discountedHotels, setDiscountedHotels] = useState<HotelResponse[]>([]);
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);

  useEffect(() => {
    loadDiscounts();
  }, []);

  const loadDiscounts = async () => {
    try {
      setLoading(true);

      // Load hotels và rooms để tìm các ưu đãi
      const hotels = await getAllHotels();
      const discountedRoomsList: DiscountedRoom[] = [];
      const hotelsWithDiscounts: HotelResponse[] = [];

      // Lấy rooms từ mỗi hotel để tìm rooms có discount
      for (const hotel of hotels.slice(0, 10)) {
        // Giới hạn 10 hotels để tránh quá nhiều API calls
        try {
          const roomsData = await getRoomsByHotel(hotel.id, 0, 50);
          const rooms = roomsData.content || [];

          rooms.forEach((room: RoomResponse) => {
            if (
              room.discountPrice &&
              room.price &&
              Number(room.discountPrice) < Number(room.price)
            ) {
              const discountPercent =
                ((Number(room.price) - Number(room.discountPrice)) /
                  Number(room.price)) *
                100;
              discountedRoomsList.push({
                room,
                hotel,
                discountPercent: Math.round(discountPercent),
              });
            }
          });

          // Nếu hotel có rooms với discount, thêm vào danh sách
          const hasDiscountedRooms = rooms.some(
            (room: RoomResponse) =>
              room.discountPrice &&
              room.price &&
              Number(room.discountPrice) < Number(room.price)
          );
          if (hasDiscountedRooms) {
            hotelsWithDiscounts.push(hotel);
          }
        } catch (err) {
          console.error(`Error loading rooms for hotel ${hotel.id}:`, err);
        }
      }

      // Sắp xếp theo discount percent giảm dần
      discountedRoomsList.sort((a, b) => b.discountPercent - a.discountPercent);

      setDiscountedRooms(discountedRoomsList.slice(0, 10)); // Top 10
      setDiscountedHotels(hotelsWithDiscounts.slice(0, 5)); // Top 5

      // Mock promo codes (có thể thay bằng API call sau)
      setPromoCodes([
        {
          id: "1",
          code: "SUMMER2024",
          title: "Giảm giá mùa hè",
          description: "Giảm 20% cho tất cả đặt phòng",
          discount: 20,
          type: "percentage",
          validUntil: "2024-12-31",
        },
        {
          id: "2",
          code: "WEEKEND50",
          title: "Cuối tuần đặc biệt",
          description: "Giảm 50.000đ cho đặt phòng cuối tuần",
          discount: 50000,
          type: "fixed",
          validUntil: "2024-12-31",
        },
        {
          id: "3",
          code: "FIRSTTIME",
          title: "Khách hàng mới",
          description: "Giảm 15% cho lần đặt phòng đầu tiên",
          discount: 15,
          type: "percentage",
          validUntil: "2024-12-31",
        },
      ]);
    } catch (err: any) {
      console.error("Error loading discounts:", err);
      Alert.alert("Lỗi", "Không thể tải danh sách ưu đãi");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyPromoCode = (code: string) => {
    Clipboard.setString(code);
    Alert.alert("Thành công", `Đã sao chép mã: ${code}`);
  };

  const handleRoomPress = (room: RoomResponse, hotel: HotelResponse) => {
    router.push({
      pathname: "/(hotel)/room-detail",
      params: {
        roomId: room.id.toString(),
        hotelId: hotel.id.toString(),
      },
    });
  };

  const handleHotelPress = (hotelId: number) => {
    router.push({
      pathname: "/(hotel)/hotel-detail",
      params: { hotelId: hotelId.toString() },
    });
  };

  const renderPromoCode = ({ item }: { item: PromoCode }) => (
    <View style={styles.promoCard}>
      <View style={styles.promoHeader}>
        <View style={styles.promoBadge}>
          <Ionicons name="pricetag" size={16} color={Colors.primary} />
          <Text style={styles.promoBadgeText}>
            {item.type === "percentage"
              ? `-${item.discount}%`
              : `-${item.discount.toLocaleString()}đ`}
          </Text>
        </View>
      </View>
      <Text style={styles.promoTitle}>{item.title}</Text>
      <Text style={styles.promoDescription}>{item.description}</Text>
      <View style={styles.promoCodeContainer}>
        <Text style={styles.promoCode}>{item.code}</Text>
        <TouchableOpacity
          style={styles.copyButton}
          onPress={() => handleCopyPromoCode(item.code)}
        >
          <Ionicons name="copy-outline" size={18} color={Colors.primary} />
          <Text style={styles.copyButtonText}>Sao chép</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.promoValidUntil}>
        Có hiệu lực đến: {item.validUntil}
      </Text>
    </View>
  );

  const renderDiscountedRoom = ({ item }: { item: DiscountedRoom }) => {
    const hotelsConverted = convertHotelResponsesToHotels(
      [item.hotel],
      require("../../assets/images/anh1.jpg")
    );
    const hotel = hotelsConverted[0];

    return (
      <TouchableOpacity
        style={styles.roomCard}
        onPress={() => handleRoomPress(item.room, item.hotel)}
        activeOpacity={0.7}
      >
        <View style={styles.roomCardHeader}>
          <View style={styles.discountBadge}>
            <Text style={styles.discountBadgeText}>
              -{item.discountPercent}%
            </Text>
          </View>
          <Text style={styles.roomHotelName}>{item.hotel.name}</Text>
        </View>
        <Text style={styles.roomType}>
          {item.room.roomType?.name || "Phòng tiêu chuẩn"}
        </Text>
        <View style={styles.roomPriceContainer}>
          <Text style={styles.roomOriginalPrice}>
            ${Number(item.room.price || 0).toLocaleString()}
          </Text>
          <Text style={styles.roomDiscountPrice}>
            ${Number(item.room.discountPrice || 0).toLocaleString()}
          </Text>
          <Text style={styles.roomPriceUnit}>/đêm</Text>
        </View>
        {item.room.description && (
          <Text style={styles.roomDescription} numberOfLines={2}>
            {item.room.description}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <StatusBar style="dark" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Đang tải ưu đãi...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar style="dark" />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Ưu đãi & Khuyến mãi</Text>
          <Text style={styles.headerSubtitle}>
            Khám phá các ưu đãi đặc biệt dành cho bạn
          </Text>
        </View>

        {/* Promo Codes Section */}
        {promoCodes.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="pricetag" size={24} color={Colors.primary} />
              <Text style={styles.sectionTitle}>Mã giảm giá</Text>
            </View>
            <FlatList
              data={promoCodes}
              renderItem={renderPromoCode}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.promoList}
            />
          </View>
        )}

        {/* Flash Sales - Discounted Rooms */}
        {discountedRooms.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="flash" size={24} color="#FF6B6B" />
              <Text style={styles.sectionTitle}>Flash Sale</Text>
            </View>
            <FlatList
              data={discountedRooms}
              renderItem={renderDiscountedRoom}
              keyExtractor={(item) => `${item.room.id}-${item.hotel.id}`}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.roomList}
            />
          </View>
        )}

        {/* Best Deals - Hotels with Discounts */}
        {discountedHotels.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="star" size={24} color="#FBBF24" />
              <Text style={styles.sectionTitle}>Khách sạn ưu đãi</Text>
            </View>
            {discountedHotels.map((hotel) => {
              const hotelsConverted = convertHotelResponsesToHotels(
                [hotel],
                require("../../assets/images/anh1.jpg")
              );
              const hotelCard = hotelsConverted[0];
              return (
                <View key={hotel.id} style={styles.hotelCardContainer}>
                  <TouchableOpacity
                    onPress={() => handleHotelPress(hotel.id)}
                    activeOpacity={0.7}
                  >
                    <HotelCard
                      hotel={hotelCard}
                      isFavorite={isFavorite(hotel.id)}
                      onToggleFavorite={toggleFavorite}
                      variant="horizontal"
                    />
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        )}

        {/* Empty State */}
        {discountedRooms.length === 0 &&
          discountedHotels.length === 0 &&
          promoCodes.length === 0 && (
            <View style={styles.emptyContainer}>
              <Ionicons
                name="pricetag-outline"
                size={64}
                color={Colors.textSecondary}
              />
              <Text style={styles.emptyTitle}>Chưa có ưu đãi</Text>
              <Text style={styles.emptyText}>
                Hiện tại chưa có ưu đãi nào. Vui lòng quay lại sau!
              </Text>
            </View>
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
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: Colors.textSecondary,
  },
  header: {
    padding: Spacing.xl,
    paddingBottom: Spacing.lg,
  },
  headerTitle: {
    fontSize: Typography.xxl,
    fontWeight: Typography.bold,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  headerSubtitle: {
    fontSize: Typography.md,
    color: Colors.textSecondary,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  sectionTitle: {
    fontSize: Typography.xl,
    fontWeight: Typography.semiBold,
    color: Colors.text,
  },
  promoList: {
    paddingHorizontal: Spacing.xl,
    gap: Spacing.md,
  },
  promoCard: {
    width: 280,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: Spacing.lg,
    marginRight: Spacing.md,
    borderWidth: 2,
    borderColor: Colors.primary,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  promoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  promoBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: `${Colors.primary}15`,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: 8,
    gap: Spacing.xs,
  },
  promoBadgeText: {
    fontSize: Typography.sm,
    fontWeight: Typography.bold,
    color: Colors.primary,
  },
  promoTitle: {
    fontSize: Typography.lg,
    fontWeight: Typography.semiBold,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  promoDescription: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
    lineHeight: 20,
  },
  promoCodeContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.background,
    padding: Spacing.md,
    borderRadius: 8,
    marginBottom: Spacing.sm,
  },
  promoCode: {
    fontSize: Typography.md,
    fontWeight: Typography.bold,
    color: Colors.primary,
    letterSpacing: 1,
  },
  copyButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  copyButtonText: {
    fontSize: Typography.sm,
    color: Colors.primary,
    fontWeight: Typography.semiBold,
  },
  promoValidUntil: {
    fontSize: Typography.xs,
    color: Colors.textSecondary,
  },
  roomList: {
    paddingHorizontal: Spacing.xl,
    gap: Spacing.md,
  },
  roomCard: {
    width: 300,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: Spacing.lg,
    marginRight: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  roomCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: Spacing.sm,
  },
  discountBadge: {
    backgroundColor: "#FF6B6B",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: 8,
  },
  discountBadgeText: {
    fontSize: Typography.sm,
    fontWeight: Typography.bold,
    color: "#FFFFFF",
  },
  roomHotelName: {
    flex: 1,
    fontSize: Typography.md,
    fontWeight: Typography.semiBold,
    color: Colors.text,
    marginLeft: Spacing.sm,
  },
  roomType: {
    fontSize: Typography.lg,
    fontWeight: Typography.bold,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  roomPriceContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: Spacing.sm,
    gap: Spacing.xs,
  },
  roomOriginalPrice: {
    fontSize: Typography.md,
    color: Colors.textSecondary,
    textDecorationLine: "line-through",
  },
  roomDiscountPrice: {
    fontSize: Typography.xl,
    fontWeight: Typography.bold,
    color: Colors.primary,
  },
  roomPriceUnit: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
  },
  roomDescription: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  hotelCardContainer: {
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.md,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 64,
    paddingHorizontal: Spacing.xl,
  },
  emptyTitle: {
    fontSize: Typography.xl,
    fontWeight: Typography.bold,
    color: Colors.text,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  emptyText: {
    fontSize: Typography.md,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 24,
  },
});
