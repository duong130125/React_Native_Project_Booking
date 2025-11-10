import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface Review {
  id: number;
  userName: string;
  userAvatar: any;
  date: string;
  rating: number;
  content: string;
}

export default function ReviewsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [showWriteReviewModal, setShowWriteReviewModal] = useState(false);
  const [selectedRating, setSelectedRating] = useState(0);
  const [reviewText, setReviewText] = useState("");

  // Mock data
  const averageRating = 5.0;
  const totalReviews = 120;
  const reviews: Review[] = [
    {
      id: 1,
      userName: "Savannah Nguyen",
      userAvatar: require("../assets/images/anh1.jpg"),
      date: "05 May, 2023",
      rating: 5,
      content:
        "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout.",
    },
    {
      id: 2,
      userName: "Wade Warren",
      userAvatar: require("../assets/images/anh4.jpg"),
      date: "04 May, 2023",
      rating: 5,
      content:
        "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout.",
    },
    {
      id: 3,
      userName: "Devon Lane",
      userAvatar: require("../assets/images/anh2.jpg"),
      date: "03 May, 2023",
      rating: 5,
      content:
        "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout.",
    },
    {
      id: 4,
      userName: "Kathryn Murphy",
      userAvatar: require("../assets/images/anh6.jpg"),
      date: "02 May, 2023",
      rating: 5,
      content:
        "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout.",
    },
  ];

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i < rating ? "star" : "star-outline"}
          size={16}
          color="#FFB800"
        />
      );
    }
    return stars;
  };

  const handleSubmitReview = () => {
    // Handle submit review logic here
    console.log("Rating:", selectedRating);
    console.log("Review:", reviewText);
    setShowWriteReviewModal(false);
    setSelectedRating(0);
    setReviewText("");
  };

  const renderReviewItem = ({ item }: { item: Review }) => (
    <View style={styles.reviewItem}>
      <View style={styles.reviewHeader}>
        <View style={styles.userInfo}>
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>
              {item.userName.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{item.userName}</Text>
            <Text style={styles.reviewDate}>{item.date}</Text>
          </View>
        </View>
        <View style={styles.starsContainer}>{renderStars(item.rating)}</View>
      </View>
      <Text style={styles.reviewContent}>{item.content}</Text>
    </View>
  );

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
        {/* Rating Summary */}
        <View style={styles.ratingSummary}>
          <Text style={styles.averageRating}>{averageRating}</Text>
          <Text style={styles.totalReviews}>{totalReviews} Reviews</Text>
          <View style={styles.summaryStarsContainer}>{renderStars(5)}</View>
        </View>

        {/* Reviews List */}
        <FlatList
          data={reviews}
          renderItem={renderReviewItem}
          keyExtractor={(item) => item.id.toString()}
          scrollEnabled={false}
          contentContainerStyle={styles.reviewsList}
        />
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
                (selectedRating === 0 || reviewText.trim() === "") &&
                  styles.submitButtonDisabled,
              ]}
              onPress={handleSubmitReview}
              disabled={selectedRating === 0 || reviewText.trim() === ""}
              activeOpacity={0.8}
            >
              <Text style={styles.submitButtonText}>Submit Review</Text>
            </TouchableOpacity>
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
});
