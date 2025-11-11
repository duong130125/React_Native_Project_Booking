import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { createCard } from "../../apis/payment";
import { PaymentCardRequest } from "../../types/payment";

const { width } = Dimensions.get("window");

export default function AddNewCardScreen() {
  const router = useRouter();
  const [showModal, setShowModal] = useState(true);
  const [loading, setLoading] = useState(false);

  const [cardNumber, setCardNumber] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [expiryMonth, setExpiryMonth] = useState("");
  const [expiryYear, setExpiryYear] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardBrand, setCardBrand] = useState("VISA");

  // Detect card brand from card number
  const detectCardBrand = (number: string): string => {
    const cleaned = number.replace(/\s/g, "");
    if (cleaned.startsWith("4")) return "VISA";
    if (cleaned.startsWith("5") || cleaned.startsWith("2")) return "MASTERCARD";
    if (cleaned.startsWith("3")) return "AMEX";
    return "VISA"; // Default
  };

  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\s/g, "");
    const formatted = cleaned.match(/.{1,4}/g)?.join(" ") || cleaned;
    setCardBrand(detectCardBrand(cleaned));
    return formatted;
  };

  const formatExpiryMonth = (text: string) => {
    const cleaned = text.replace(/\D/g, "").slice(0, 2);
    if (cleaned.length === 2 && parseInt(cleaned) > 12) {
      return "12";
    }
    return cleaned;
  };

  const formatExpiryYear = (text: string) => {
    return text.replace(/\D/g, "").slice(0, 4);
  };

  const handleAddCard = async () => {
    // Validation
    const cleanedCardNumber = cardNumber.replace(/\s/g, "");
    if (cleanedCardNumber.length < 13 || cleanedCardNumber.length > 19) {
      Alert.alert("Lỗi", "Số thẻ phải có từ 13 đến 19 chữ số");
      return;
    }

    if (!cardHolder.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập tên chủ thẻ");
      return;
    }

    if (
      !expiryMonth ||
      parseInt(expiryMonth) < 1 ||
      parseInt(expiryMonth) > 12
    ) {
      Alert.alert("Lỗi", "Tháng hết hạn không hợp lệ");
      return;
    }

    const currentYear = new Date().getFullYear();
    if (
      !expiryYear ||
      expiryYear.length !== 4 ||
      parseInt(expiryYear) < currentYear
    ) {
      Alert.alert("Lỗi", "Năm hết hạn không hợp lệ");
      return;
    }

    if (!cvv || cvv.length < 3) {
      Alert.alert("Lỗi", "CVV phải có ít nhất 3 chữ số");
      return;
    }

    try {
      setLoading(true);

      const request: PaymentCardRequest = {
        cardHolderName: cardHolder.trim(),
        cardBrand: cardBrand,
        cardNumber: cleanedCardNumber,
        expMonth: parseInt(expiryMonth),
        expYear: parseInt(expiryYear),
        cvv: cvv,
        isDefault: false, // Có thể thêm option để set default
      };

      await createCard(request);

      Alert.alert("Thành công", "Thêm thẻ thành công", [
        {
          text: "OK",
          onPress: () => {
            setShowModal(false);
            router.back();
          },
        },
      ]);
    } catch (error: any) {
      console.error("Error adding card:", error);
      Alert.alert(
        "Lỗi",
        error.response?.data?.message ||
          error.message ||
          "Không thể thêm thẻ. Vui lòng thử lại."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={showModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => {
        setShowModal(false);
        router.back();
      }}
    >
      <View style={styles.container}>
        <StatusBar style="light" />
        {/* Blurred Background */}
        <Image
          source={require("../../assets/images/anh6.jpg")}
          style={styles.backgroundImage}
          blurRadius={10}
        />
        <View style={styles.overlay} />

        {/* Card Form */}
        <View style={styles.card}>
          {/* Drag Handle */}
          <View style={styles.dragHandle} />

          {/* Title */}
          <Text style={styles.title}>Thêm thẻ mới</Text>

          {/* Card Number */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Số thẻ</Text>
            <TextInput
              style={styles.input}
              value={cardNumber}
              onChangeText={(text) => setCardNumber(formatCardNumber(text))}
              placeholder="0000 0000 0000 0000"
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
              maxLength={19}
            />
          </View>

          {/* Card Holder Name */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Tên chủ thẻ</Text>
            <TextInput
              style={styles.input}
              value={cardHolder}
              onChangeText={setCardHolder}
              placeholder="Nguyễn Văn A"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Expiry Date and CVV */}
          <View style={styles.row}>
            <View style={[styles.inputSection, styles.halfWidth]}>
              <Text style={styles.inputLabel}>Tháng hết hạn</Text>
              <TextInput
                style={styles.input}
                value={expiryMonth}
                onChangeText={(text) => setExpiryMonth(formatExpiryMonth(text))}
                placeholder="MM"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                maxLength={2}
              />
            </View>

            <View style={[styles.inputSection, styles.halfWidth]}>
              <Text style={styles.inputLabel}>Năm hết hạn</Text>
              <TextInput
                style={styles.input}
                value={expiryYear}
                onChangeText={(text) => setExpiryYear(formatExpiryYear(text))}
                placeholder="YYYY"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                maxLength={4}
              />
            </View>

            <View style={[styles.inputSection, styles.halfWidth]}>
              <Text style={styles.inputLabel}>CVV</Text>
              <TextInput
                style={styles.input}
                value={cvv}
                onChangeText={(text) =>
                  setCvv(text.replace(/\D/g, "").slice(0, 3))
                }
                placeholder="***"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                maxLength={3}
                secureTextEntry
              />
            </View>
          </View>

          {/* Add Card Button */}
          <TouchableOpacity
            style={[
              styles.addCardButton,
              loading && styles.addCardButtonDisabled,
            ]}
            onPress={handleAddCard}
            activeOpacity={0.8}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.addCardButtonText}>Thêm thẻ</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    position: "absolute",
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  overlay: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  card: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    maxHeight: "85%",
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: "#D1D5DB",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 24,
  },
  inputSection: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#111827",
    backgroundColor: "#F9FAFB",
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  addCardButton: {
    backgroundColor: "#4F46E5",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  addCardButtonDisabled: {
    opacity: 0.6,
  },
  addCardButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
