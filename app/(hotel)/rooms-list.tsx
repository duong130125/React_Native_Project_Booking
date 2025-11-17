import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getHotelById } from "../../apis/hotel";
import { getRoomsByHotel } from "../../apis/room";
import { Colors } from "../../constants/colors";
import { HotelResponse, RoomResponse } from "../../types/hotel";

const { width } = Dimensions.get("window");

export default function RoomsListScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [hotel, setHotel] = useState<HotelResponse | null>(null);
  const [rooms, setRooms] = useState<RoomResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (params.hotelId) {
      loadRooms();
    }
  }, [params.hotelId]);

  const loadRooms = async () => {
    try {
      setLoading(true);
      setError(null);
      const hotelId = Number(params.hotelId);

      const [hotelData, roomsData] = await Promise.all([
        getHotelById(hotelId),
        getRoomsByHotel(hotelId, 0, 100), // Load tất cả rooms
      ]);

      console.log("Rooms data loaded:", {
        hotelId: hotelId,
        roomsCount: roomsData.content.length,
        rooms: roomsData.content.map((room: RoomResponse) => ({
          id: room.id,
          roomNumber: room.roomNumber,
          imagesCount: room.images?.length || 0,
          validImagesCount:
            room.images?.filter(
              (img) =>
                img &&
                img.imageUrl &&
                !img.imageUrl.includes("example.com") &&
                img.imageUrl.trim() !== ""
            ).length || 0,
          firstImageUrl: room.images?.[0]?.imageUrl,
          allImageUrls: room.images?.map((img) => img.imageUrl) || [],
        })),
      });

      setHotel(hotelData);
      setRooms(roomsData.content);
    } catch (err: any) {
      console.error("Error loading rooms:", err);
      setError(err.message || "Không thể tải danh sách phòng");
      Alert.alert("Lỗi", err.message || "Không thể tải danh sách phòng");
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Ionicons key={i} name="star" size={14} color="#FBBF24" />);
    }
    if (hasHalfStar) {
      stars.push(
        <Ionicons key="half" name="star-half" size={14} color="#FBBF24" />
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

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <StatusBar style="light" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !hotel) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <StatusBar style="light" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            {error || "Không tìm thấy thông tin khách sạn"}
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadRooms}>
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <View style={styles.iconBackground}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </View>
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>{hotel.name}</Text>
          <View style={styles.headerRating}>
            <View style={styles.starsContainer}>
              {renderStars(hotel.averageRating || 0)}
            </View>
            <Text style={styles.headerRatingText}>
              {hotel.averageRating?.toFixed(1) || "0.0"}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>{rooms.length} phòng có sẵn</Text>

        {rooms.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="bed-outline" size={64} color="#D1D5DB" />
            <Text style={styles.emptyText}>Không có phòng nào</Text>
          </View>
        ) : (
          rooms.map((room) => (
            <TouchableOpacity
              key={room.id}
              style={styles.roomCard}
              onPress={() => {
                router.push({
                  pathname: "/room-detail",
                  params: {
                    hotelId: hotel.id.toString(),
                    roomId: room.id.toString(),
                  },
                } as any);
              }}
              activeOpacity={0.8}
            >
              <Image
                source={
                  room.images &&
                  room.images.length > 0 &&
                  room.images[0]?.imageUrl &&
                  !room.images[0].imageUrl.includes("example.com")
                    ? { uri: room.images[0].imageUrl }
                    : require("../../assets/images/anh1.jpg")
                }
                style={styles.roomImage}
                defaultSource={require("../../assets/images/anh1.jpg")}
                onError={(error) => {
                  const errorMessage =
                    error?.nativeEvent?.error || "Unknown error";
                  console.warn("Room image load error:", errorMessage);
                }}
                onLoadStart={() => {
                  console.log(
                    "Loading room image:",
                    room.images?.[0]?.imageUrl
                  );
                }}
                onLoadEnd={() => {
                  console.log("Room image loaded successfully");
                }}
              />
              <View style={styles.roomInfo}>
                <Text style={styles.roomName}>
                  {room.roomType?.name || "Phòng tiêu chuẩn"}
                </Text>
                <Text style={styles.roomDescription}>
                  {room.description || "Phòng đẹp, thoáng mát"}
                </Text>
                <View style={styles.roomDetails}>
                  <View style={styles.roomDetailItem}>
                    <Ionicons name="people-outline" size={16} color="#6B7280" />
                    <Text style={styles.roomDetailText}>
                      {String(room.capacity || 2)} người
                    </Text>
                  </View>
                  <View style={styles.roomDetailItem}>
                    <Ionicons name="square-outline" size={16} color="#6B7280" />
                    <Text style={styles.roomDetailText}>
                      {String(room.roomSize || 25)}m²
                    </Text>
                  </View>
                  {room.amenities?.length ? (
                    <View style={styles.roomDetailItem}>
                      <Ionicons name="star-outline" size={16} color="#6B7280" />
                      <Text style={styles.roomDetailText}>
                        {String(room.amenities.length || 0)} tiện ích
                      </Text>
                    </View>
                  ) : null}
                </View>
                <View style={styles.roomFooter}>
                  <Text style={styles.roomPrice}>
                    ${Number(room.price).toLocaleString()}
                  </Text>
                  <Text style={styles.roomPriceUnit}>/đêm</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
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
    padding: 16,
    backgroundColor: Colors.primary,
  },
  backButton: {
    marginRight: 12,
  },
  iconBackground: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  headerRating: {
    flexDirection: "row",
    alignItems: "center",
  },
  starsContainer: {
    flexDirection: "row",
    marginRight: 4,
  },
  headerRatingText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#6B7280",
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#DC2626",
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 16,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: "#6B7280",
    marginTop: 16,
  },
  roomCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  roomImage: {
    width: "100%",
    height: 200,
    resizeMode: "cover",
  },
  roomInfo: {
    padding: 16,
  },
  roomName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },
  roomDescription: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 12,
  },
  roomDetails: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 12,
    gap: 16,
  },
  roomDetailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  roomDetailText: {
    fontSize: 14,
    color: "#6B7280",
  },
  roomFooter: {
    flexDirection: "row",
    alignItems: "baseline",
    marginTop: 8,
  },
  roomPrice: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.primary,
  },
  roomPriceUnit: {
    fontSize: 14,
    color: "#6B7280",
    marginLeft: 4,
  },
});
