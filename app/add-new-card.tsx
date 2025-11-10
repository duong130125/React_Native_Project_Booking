import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  Dimensions,
  Image,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

export default function AddNewCardScreen() {
  const router = useRouter();
  const [showModal, setShowModal] = useState(true);
  const [cardNumber, setCardNumber] = useState("8976 5467 XX87 0098");
  const [cardHolder, setCardHolder] = useState("Curtis Weaver");
  const [expiryDate, setExpiryDate] = useState("12/2026");
  const [cvv, setCvv] = useState("***");

  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\s/g, "");
    const formatted = cleaned.match(/.{1,4}/g)?.join(" ") || cleaned;
    return formatted;
  };

  const formatExpiryDate = (text: string) => {
    const cleaned = text.replace(/\D/g, "");
    if (cleaned.length >= 2) {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 6)}`;
    }
    return cleaned;
  };

  const handleAddCard = () => {
    // Handle add card logic here
    setShowModal(false);
    router.back();
    // Navigate back to confirm-pay with card added
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
          source={require("../assets/images/anh6.jpg")}
          style={styles.backgroundImage}
          blurRadius={10}
        />
        <View style={styles.overlay} />

        {/* Card Form */}
        <View style={styles.card}>
          {/* Drag Handle */}
          <View style={styles.dragHandle} />

          {/* Title */}
          <Text style={styles.title}>Add New Card</Text>

          {/* Card Number */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Card Number</Text>
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
            <Text style={styles.inputLabel}>Card Holder Name</Text>
            <TextInput
              style={styles.input}
              value={cardHolder}
              onChangeText={setCardHolder}
              placeholder="John Doe"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Expiry Date and CVV */}
          <View style={styles.row}>
            <View style={[styles.inputSection, styles.halfWidth]}>
              <Text style={styles.inputLabel}>Expiry Date</Text>
              <TextInput
                style={styles.input}
                value={expiryDate}
                onChangeText={(text) => setExpiryDate(formatExpiryDate(text))}
                placeholder="MM/YYYY"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                maxLength={7}
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
            style={styles.addCardButton}
            onPress={handleAddCard}
            activeOpacity={0.8}
          >
            <Text style={styles.addCardButtonText}>Add Card</Text>
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
  addCardButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
