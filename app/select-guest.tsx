import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  Dimensions,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

export default function SelectGuestScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [showModal, setShowModal] = useState(true);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(2);
  const [infants, setInfants] = useState(0);

  const handleNext = () => {
    setShowModal(false);
    router.push({
      pathname: "/confirm-pay",
      params: {
        adults: adults.toString(),
        children: children.toString(),
        infants: infants.toString(),
        startDate: params.startDate,
        endDate: params.endDate,
      },
    } as any);
  };

  const adjustCount = (
    current: number,
    setter: (value: number) => void,
    delta: number,
    min: number = 0
  ) => {
    const newValue = current + delta;
    if (newValue >= min) {
      setter(newValue);
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
          source={require("../assets/images/anh2.jpg")}
          style={styles.backgroundImage}
          blurRadius={10}
        />
        <View style={styles.overlay} />

        {/* Guest Selection Card */}
        <View style={styles.card}>
          {/* Drag Handle */}
          <View style={styles.dragHandle} />

          {/* Title */}
          <Text style={styles.title}>Select Guest</Text>

          {/* Adults Section */}
          <View style={styles.guestSection}>
            <View style={styles.guestInfo}>
              <Text style={styles.guestLabel}>Adults</Text>
              <Text style={styles.guestSubtitle}>Ages 14 or above</Text>
            </View>
            <View style={styles.stepper}>
              <TouchableOpacity
                style={[
                  styles.stepperButton,
                  adults === 0 && styles.stepperButtonDisabled,
                ]}
                onPress={() => adjustCount(adults, setAdults, -1)}
                disabled={adults === 0}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="remove"
                  size={20}
                  color={adults === 0 ? "#D1D5DB" : "#111827"}
                />
              </TouchableOpacity>
              <Text style={styles.stepperValue}>{adults}</Text>
              <TouchableOpacity
                style={styles.stepperButton}
                onPress={() => adjustCount(adults, setAdults, 1)}
                activeOpacity={0.7}
              >
                <Ionicons name="add" size={20} color="#111827" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Children Section */}
          <View style={styles.guestSection}>
            <View style={styles.guestInfo}>
              <Text style={styles.guestLabel}>Children</Text>
              <Text style={styles.guestSubtitle}>Ages 2-13</Text>
            </View>
            <View style={styles.stepper}>
              <TouchableOpacity
                style={[
                  styles.stepperButton,
                  children === 0 && styles.stepperButtonDisabled,
                ]}
                onPress={() => adjustCount(children, setChildren, -1)}
                disabled={children === 0}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="remove"
                  size={20}
                  color={children === 0 ? "#D1D5DB" : "#111827"}
                />
              </TouchableOpacity>
              <Text style={styles.stepperValue}>{children}</Text>
              <TouchableOpacity
                style={styles.stepperButton}
                onPress={() => adjustCount(children, setChildren, 1)}
                activeOpacity={0.7}
              >
                <Ionicons name="add" size={20} color="#111827" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Infants Section */}
          <View style={styles.guestSection}>
            <View style={styles.guestInfo}>
              <Text style={styles.guestLabel}>Infants</Text>
              <Text style={styles.guestSubtitle}>Under 2</Text>
            </View>
            <View style={styles.stepper}>
              <TouchableOpacity
                style={[
                  styles.stepperButton,
                  infants === 0 && styles.stepperButtonDisabled,
                ]}
                onPress={() => adjustCount(infants, setInfants, -1)}
                disabled={infants === 0}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="remove"
                  size={20}
                  color={infants === 0 ? "#D1D5DB" : "#111827"}
                />
              </TouchableOpacity>
              <Text style={styles.stepperValue}>{infants}</Text>
              <TouchableOpacity
                style={styles.stepperButton}
                onPress={() => adjustCount(infants, setInfants, 1)}
                activeOpacity={0.7}
              >
                <Ionicons name="add" size={20} color="#111827" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Next Button */}
          <TouchableOpacity
            style={styles.nextButton}
            onPress={handleNext}
            activeOpacity={0.8}
          >
            <Text style={styles.nextButtonText}>Next</Text>
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
    marginBottom: 32,
  },
  guestSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 32,
  },
  guestInfo: {
    flex: 1,
  },
  guestLabel: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  guestSubtitle: {
    fontSize: 14,
    color: "#6B7280",
  },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
  },
  stepperButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  stepperButtonDisabled: {
    backgroundColor: "#F9FAFB",
  },
  stepperValue: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    minWidth: 30,
    textAlign: "center",
  },
  nextButton: {
    backgroundColor: "#4F46E5",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
