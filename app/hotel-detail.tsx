import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width } = Dimensions.get("window");

interface Hotel {
  id: number;
  name: string;
  location: string;
  price: number;
  rating: number;
  reviews: number;
  image: any;
  overview: string;
  photos: any[];
  host: {
    name: string;
    avatar: any;
  };
  guests: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
}

export default function HotelDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    loadFavoriteStatus();
  }, [params.hotelId]);

  const loadFavoriteStatus = async () => {
    try {
      const favorites = await AsyncStorage.getItem("favorites");
      if (favorites) {
        const favoriteList = JSON.parse(favorites);
        setIsFavorite(favoriteList.includes(Number(params.hotelId)));
      }
    } catch (error) {
      console.error("Error loading favorite status:", error);
    }
  };

  const handleToggleFavorite = async () => {
    try {
      const hotelId = Number(params.hotelId);
      const favorites = await AsyncStorage.getItem("favorites");
      const favoriteList = favorites ? JSON.parse(favorites) : [];

      if (isFavorite) {
        // Remove from favorites
        const updatedFavorites = favoriteList.filter((id: number) => id !== hotelId);
        await AsyncStorage.setItem("favorites", JSON.stringify(updatedFavorites));
        
        // Remove from bookmarks
        const bookmarks = await AsyncStorage.getItem("bookmarks");
        if (bookmarks) {
          const bookmarkList = JSON.parse(bookmarks);
          const updatedBookmarks = bookmarkList.filter(
            (b: any) => b.hotelId !== hotelId.toString()
          );
          await AsyncStorage.setItem("bookmarks", JSON.stringify(updatedBookmarks));
        }
        setIsFavorite(false);
      } else {
        // Add to favorites
        const updatedFavorites = [...favoriteList, hotelId];
        await AsyncStorage.setItem("favorites", JSON.stringify(updatedFavorites));
        
        // Add to bookmarks
        const bookmark = {
          id: Date.now().toString(),
          hotelId: hotelId.toString(),
          hotelName: hotel.name,
          location: hotel.location,
          rating: hotel.rating,
          reviews: hotel.reviews,
          price: hotel.price,
          image: hotel.image,
          savedAt: "Today",
        };
        
        const bookmarks = await AsyncStorage.getItem("bookmarks");
        const bookmarkList = bookmarks ? JSON.parse(bookmarks) : [];
        bookmarkList.unshift(bookmark);
        await AsyncStorage.setItem("bookmarks", JSON.stringify(bookmarkList));

        // Create notification
        const notification = {
          id: Date.now().toString(),
          type: "bookmark",
          title: `You Saved "${hotel.name}"`,
          description: "Your just bookmarked",
          date: "Today",
          image: hotel.image,
          createdAt: new Date().toISOString(),
        };
        
        const notifications = await AsyncStorage.getItem("notifications");
        const notificationList = notifications ? JSON.parse(notifications) : [];
        notificationList.unshift(notification);
        await AsyncStorage.setItem("notifications", JSON.stringify(notificationList));
        
        setIsFavorite(true);
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  // Mock data - trong thực tế sẽ lấy từ API
  const hotel: Hotel = {
    id: 1,
    name: "Malon Greens",
    location: "Mumbai, Maharashtra",
    price: 120,
    rating: 5.0,
    reviews: 120,
    image: require("../assets/images/image-booking.png"),
    overview:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    photos: [
      require("../assets/images/image-booking.png"),
      require("../assets/images/image-booking.png"),
      require("../assets/images/image-booking.png"),
      require("../assets/images/image-booking.png"),
      require("../assets/images/image-booking.png"),
    ],
    host: {
      name: "Marine",
      avatar: require("../assets/images/image-booking.png"),
    },
    guests: 2,
    bedrooms: 1,
    beds: 1,
    bathrooms: 1,
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i < Math.floor(rating) ? "star" : "star-outline"}
          size={16}
          color="#FFB800"
        />
      );
    }
    return stars;
  };

  const handleViewPhotos = () => {
    router.push({
      pathname: "/hotel-photos",
      params: { hotelId: hotel.id.toString() },
    } as any);
  };

  const handleImagePress = (index: number) => {
    router.push({
      pathname: "/zoom-image",
      params: {
        imageIndex: index.toString(),
        hotelId: hotel.id.toString(),
      },
    } as any);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar style="light" />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Main Image */}
        <View style={styles.imageContainer}>
          <Image source={hotel.image} style={styles.mainImage} />
          
          {/* Header Icons */}
          <View style={styles.headerIcons}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => router.back()}
            >
              <View style={styles.iconBackground}>
                <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
            
            <View style={styles.rightIcons}>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={handleToggleFavorite}
              >
                <View style={styles.iconBackground}>
                  <Ionicons
                    name={isFavorite ? "heart" : "heart-outline"}
                    size={24}
                    color={isFavorite ? "#EF4444" : "#FFFFFF"}
                  />
                </View>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.iconButton}>
                <View style={styles.iconBackground}>
                  <Ionicons name="share-outline" size={24} color="#FFFFFF" />
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Rating and Title */}
          <View style={styles.ratingContainer}>
            <View style={styles.starsContainer}>
              {renderStars(hotel.rating)}
            </View>
            <Text style={styles.ratingText}>
              {hotel.rating} ({hotel.reviews} Reviews)
            </Text>
          </View>

          <Text style={styles.hotelName}>{hotel.name}</Text>
          <Text style={styles.location}>{hotel.location}</Text>

          {/* Overview */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Overview</Text>
            <Text style={styles.overviewText}>{hotel.overview}</Text>
          </View>

          {/* Reviews Link */}
          <TouchableOpacity
            style={styles.section}
            onPress={() => {
              router.push({
                pathname: "/reviews",
                params: { hotelId: hotel.id.toString() },
              } as any);
            }}
            activeOpacity={0.7}
          >
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Reviews</Text>
              <Ionicons name="chevron-forward" size={20} color="#4F46E5" />
            </View>
            <View style={styles.ratingContainer}>
              <View style={styles.starsContainer}>{renderStars(hotel.rating)}</View>
              <Text style={styles.ratingText}>
                {hotel.rating} ({hotel.reviews} Reviews)
              </Text>
            </View>
          </TouchableOpacity>

          {/* Photos */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Photos</Text>
              <TouchableOpacity onPress={handleViewPhotos}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.photosScroll}
            >
              {hotel.photos.slice(0, 3).map((photo, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleImagePress(index)}
                  activeOpacity={0.8}
                >
                  <Image source={photo} style={styles.photoThumbnail} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Host Information */}
          <View style={styles.section}>
            <View style={styles.hostContainer}>
              <View style={styles.hostInfo}>
                <Text style={styles.hostText}>
                  Room in boutique hotel hosted by {hotel.host.name}
                </Text>
                <Text style={styles.hostDetails}>
                  {hotel.guests} guests • {hotel.bedrooms} bedroom • {hotel.beds}{" "}
                  bed • {hotel.bathrooms} bathroom
                </Text>
              </View>
              <Image source={hotel.host.avatar} style={styles.hostAvatar} />
            </View>
          </View>

          {/* Features */}
          <View style={styles.section}>
            <View style={styles.featureItem}>
              <View style={styles.featureIconContainer}>
                <Ionicons name="sparkles-outline" size={24} color="#4F46E5" />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Enhanced Clean</Text>
                <Text style={styles.featureDescription}>
                  This host committed to Airbnb's clone 5-step enhanced cleaning
                  process.
                </Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <View style={styles.featureIconContainer}>
                <Ionicons name="location-outline" size={24} color="#4F46E5" />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Great Location</Text>
                <Text style={styles.featureDescription}>
                  95% of recent guests give the location a 5-star rating.
                </Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <View style={styles.featureIconContainer}>
                <Ionicons name="thumbs-up-outline" size={24} color="#4F46E5" />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Great check-in experience</Text>
                <Text style={styles.featureDescription}>
                  90% of recent guests gave the check-in process a 5-star rating.
                </Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <View style={styles.featureIconContainer}>
                <Ionicons name="calendar-outline" size={24} color="#4F46E5" />
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>Free cancellation</Text>
                <Text style={styles.featureDescription}>
                  Free cancellation until 2:00 PM on 8 May.
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.priceContainer}>
          <Text style={styles.priceText}>${hotel.price}</Text>
          <Text style={styles.priceUnit}>/night</Text>
        </View>
        <TouchableOpacity
          style={styles.selectDateButton}
          onPress={() => {
            router.push("/select-date" as any);
          }}
          activeOpacity={0.8}
        >
          <Text style={styles.selectDateText}>Select Date</Text>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  imageContainer: {
    width: "100%",
    height: 300,
    position: "relative",
  },
  mainImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  headerIcons: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    paddingTop: 50,
  },
  iconButton: {
    marginHorizontal: 4,
  },
  iconBackground: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  rightIcons: {
    flexDirection: "row",
    gap: 8,
  },
  content: {
    padding: 20,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  starsContainer: {
    flexDirection: "row",
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#111827",
  },
  hotelName: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  location: {
    fontSize: 16,
    color: "#6B7280",
    marginBottom: 24,
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
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 12,
  },
  overviewText: {
    fontSize: 16,
    lineHeight: 24,
    color: "#4B5563",
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4F46E5",
  },
  photosScroll: {
    gap: 12,
    paddingRight: 20,
  },
  photoThumbnail: {
    width: 120,
    height: 120,
    borderRadius: 12,
    marginRight: 12,
    backgroundColor: "#F3F4F6",
  },
  hostContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: 16,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  hostInfo: {
    flex: 1,
    marginRight: 12,
  },
  hostText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  hostDetails: {
    fontSize: 14,
    color: "#6B7280",
  },
  hostAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  featureItem: {
    flexDirection: "row",
    marginBottom: 24,
  },
  featureIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#EEF2FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    paddingBottom: 34,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  priceText: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
  },
  priceUnit: {
    fontSize: 16,
    color: "#6B7280",
    marginLeft: 4,
  },
  selectDateButton: {
    backgroundColor: "#4F46E5",
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: "#4F46E5",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  selectDateText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
});

