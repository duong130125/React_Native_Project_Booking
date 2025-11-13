import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
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
  addReview,
  getAverageRatingByHotel,
  getAverageRatingByRoom,
  getReviewsByHotel,
  getReviewsByRoom,
} from "../../apis/review";
import ErrorNotification from "../../components/ErrorNotification";
import SuccessNotification from "../../components/SuccessNotification";
import { ReviewResponse } from "../../types/hotel";

export default function ReviewsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [showWriteReviewModal, setShowWriteReviewModal] = useState(false);
  const [selectedRating, setSelectedRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [reviews, setReviews] = useState<ReviewResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [showErrorNotification, setShowErrorNotification] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const hotelId = params.hotelId ? parseInt(params.hotelId as string) : null;
  const roomId = params.roomId ? parseInt(params.roomId as string) : null;
  const reviewType = hotelId ? "hotel" : "room";
  const targetId = hotelId || roomId;

  useEffect(() => {
    loadReviews();
  }, [hotelId, roomId]);

  const loadReviews = async () => {
    if (!targetId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      let reviewsData;
      let avgRating;

      if (hotelId) {
        reviewsData = await getReviewsByHotel(hotelId, 0, 100);
        avgRating = await getAverageRatingByHotel(hotelId);
      } else if (roomId) {
        reviewsData = await getReviewsByRoom(roomId, 0, 100);
        avgRating = await getAverageRatingByRoom(roomId);
      } else {
        return;
      }

      setReviews(reviewsData.content);
      setTotalReviews(reviewsData.totalElements);
      setAverageRating(avgRating || 0);
    } catch (error: any) {
      console.error("Error loading reviews:", error);
      setErrorMessage(
        error.response?.data?.message ||
          error.message ||
          "Không thể tải đánh giá"
      );
      setShowErrorNotification(true);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number, size: number = 16) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <Ionicons key={i} name="star" size={size} color="#FFB800" />
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <Ionicons key={i} name="star-half" size={size} color="#FFB800" />
        );
      } else {
        stars.push(
          <Ionicons key={i} name="star-outline" size={size} color="#FFB800" />
        );
      }
    }
    return stars;
  };

  const handleSubmitReview = async () => {
    if (!targetId) {
      setErrorMessage("Thiếu thông tin khách sạn/phòng");
      setShowErrorNotification(true);
      return;
    }

    if (selectedRating === 0) {
      setErrorMessage("Vui lòng chọn đánh giá");
      setShowErrorNotification(true);
      return;
    }

    try {
      setSubmitting(true);
      setErrorMessage("");

      const reviewRequest: {
        hotelId?: number;
        roomId?: number;
        rating: number;
        comment?: string;
      } = {
        rating: selectedRating,
        comment: reviewText.trim() || undefined,
      };

      if (hotelId) {
        reviewRequest.hotelId = hotelId;
      } else if (roomId) {
        reviewRequest.roomId = roomId;
      }

      await addReview(reviewRequest);
      setShowSuccessNotification(true);
      setShowWriteReviewModal(false);
      setSelectedRating(0);
      setReviewText("");

      // Reload reviews after submitting
      setTimeout(() => {
        loadReviews();
      }, 1000);
    } catch (error: any) {
      console.error("Error submitting review:", error);
      setErrorMessage(
        error.response?.data?.message ||
          error.message ||
          "Không thể gửi đánh giá. Vui lòng thử lại."
      );
      setShowErrorNotification(true);
    } finally {
      setSubmitting(false);
    }
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

  const getInitials = (name: string | undefined) => {
    if (!name) return "?";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (
        parts[0].charAt(0) + parts[parts.length - 1].charAt(0)
      ).toUpperCase();
    }
    return name.charAt(0).toUpperCase();
  };

  const renderReviewItem = ({ item }: { item: ReviewResponse }) => {
    const userName = item.user?.fullName || "Anonymous";
    const userAvatar = item.user?.avatarUrl;
    const rating = item.rating || 0;
    const comment = item.comment || "";
    const date = formatDate(item.createdAt);

    return (
      <View style={styles.reviewItem}>
        <View style={styles.reviewHeader}>
          <View style={styles.userInfo}>
            {userAvatar ? (
              <Image
                source={{ uri: userAvatar }}
                style={styles.avatarImage}
                defaultSource={require("../../assets/images/anh1.jpg")}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>{getInitials(userName)}</Text>
              </View>
            )}
            <View style={styles.userDetails}>
              <Text style={styles.userName}>{userName}</Text>
              <Text style={styles.reviewDate}>{date}</Text>
            </View>
          </View>
          <View style={styles.starsContainer}>{renderStars(rating)}</View>
        </View>
        {comment && <Text style={styles.reviewContent}>{comment}</Text>}
      </View>
    );
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
        <Text style={styles.headerTitle}>Reviews</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4F46E5" />
            <Text style={styles.loadingText}>Đang tải đánh giá...</Text>
          </View>
        ) : (
          <>
            {/* Rating Summary */}
            <View style={styles.ratingSummary}>
              <Text style={styles.averageRating}>
                {averageRating > 0 ? averageRating.toFixed(1) : "0.0"}
              </Text>
              <Text style={styles.totalReviews}>
                {totalReviews} {totalReviews === 1 ? "Đánh giá" : "Đánh giá"}
              </Text>
              <View style={styles.summaryStarsContainer}>
                {renderStars(averageRating, 20)}
              </View>
            </View>

            {/* Reviews List */}
            {reviews.length > 0 ? (
              <FlatList
                data={reviews}
                renderItem={renderReviewItem}
                keyExtractor={(item) =>
                  item.id?.toString() || Math.random().toString()
                }
                scrollEnabled={false}
                contentContainerStyle={styles.reviewsList}
              />
            ) : (
              <View style={styles.emptyState}>
                <Ionicons
                  name="chatbubbles-outline"
                  size={64}
                  color="#D1D5DB"
                />
                <Text style={styles.emptyStateText}>
                  Chưa có đánh giá nào. Hãy là người đầu tiên đánh giá!
                </Text>
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* Write Review Button */}
      <TouchableOpacity
        style={styles.writeReviewButton}
        onPress={() => setShowWriteReviewModal(true)}
        activeOpacity={0.8}
      >
        <View style={styles.writeReviewButtonInner}>
          <Ionicons name="create-outline" size={24} color="#FFFFFF" />
        </View>
      </TouchableOpacity>

      {/* Write Review Modal */}
      <Modal
        visible={showWriteReviewModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowWriteReviewModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Write Review</Text>
              <TouchableOpacity
                onPress={() => setShowWriteReviewModal(false)}
                style={styles.closeModalButton}
              >
                <Ionicons name="close" size={24} color="#111827" />
              </TouchableOpacity>
            </View>

            {/* Rating Stars */}
            <View style={styles.ratingSection}>
              <Text style={styles.ratingLabel}>Your Rating</Text>
              <View style={styles.selectableStarsContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    onPress={() => setSelectedRating(star)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={star <= selectedRating ? "star" : "star-outline"}
                      size={40}
                      color={star <= selectedRating ? "#FFB800" : "#D1D5DB"}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Review Text Area */}
            <View style={styles.textAreaSection}>
              <Text style={styles.textAreaLabel}>Your Review</Text>
              <TextInput
                style={styles.textArea}
                placeholder="Share your experience..."
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={6}
                value={reviewText}
                onChangeText={setReviewText}
                textAlignVertical="top"
              />
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[
                styles.submitButton,
                (selectedRating === 0 || submitting) &&
                  styles.submitButtonDisabled,
              ]}
              onPress={handleSubmitReview}
              disabled={selectedRating === 0 || submitting}
              activeOpacity={0.8}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.submitButtonText}>Gửi đánh giá</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Success Notification */}
      {showSuccessNotification && (
        <SuccessNotification
          message="Đánh giá đã được gửi thành công!"
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
  },
  ratingSummary: {
    alignItems: "center",
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    marginBottom: 24,
  },
  averageRating: {
    fontSize: 48,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },
  totalReviews: {
    fontSize: 16,
    color: "#6B7280",
    marginBottom: 12,
  },
  summaryStarsContainer: {
    flexDirection: "row",
    gap: 4,
  },
  reviewsList: {
    gap: 24,
  },
  reviewItem: {
    marginBottom: 24,
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#4F46E5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  reviewDate: {
    fontSize: 14,
    color: "#6B7280",
  },
  starsContainer: {
    flexDirection: "row",
    gap: 2,
  },
  reviewContent: {
    fontSize: 14,
    lineHeight: 20,
    color: "#4B5563",
  },
  writeReviewButton: {
    position: "absolute",
    bottom: 24,
    right: 24,
    zIndex: 10,
  },
  writeReviewButtonInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#4F46E5",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#4F46E5",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
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
    marginBottom: 24,
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
  ratingSection: {
    marginBottom: 24,
  },
  ratingLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 16,
  },
  selectableStarsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
  },
  textAreaSection: {
    marginBottom: 24,
  },
  textAreaLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 12,
  },
  textArea: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#111827",
    minHeight: 120,
    backgroundColor: "#F9FAFB",
  },
  submitButton: {
    backgroundColor: "#4F46E5",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  submitButtonDisabled: {
    backgroundColor: "#D1D5DB",
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 64,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: "#6B7280",
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
    textAlign: "center",
  },
  avatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
});
