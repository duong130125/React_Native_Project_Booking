import { AntDesign } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import {
  Dimensions,
  Image,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width, height } = Dimensions.get("window");

export default function ZoomImageScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Get image from params - support both 'image' and 'imageUrl' params
  const getImageSource = () => {
    // Try imageUrl first (from hotel-photos, room-detail)
    if (
      params.imageUrl &&
      typeof params.imageUrl === "string" &&
      params.imageUrl.trim() !== ""
    ) {
      return { uri: params.imageUrl };
    }

    // Try image param (from hotel-detail)
    if (
      params.image &&
      typeof params.image === "string" &&
      params.image.trim() !== ""
    ) {
      return { uri: params.image };
    }

    // Fallback to default
    return require("../../assets/images/anh1.jpg");
  };

  const image = getImageSource();

  return (
    <View style={styles.container}>
      <StatusBar hidden />

      {/* Close Button */}
      <SafeAreaView style={styles.buttonContainer} edges={["top"]}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <View style={styles.closeButtonCircle}>
            <AntDesign name="close-circle" size={24} color="#FFFFFF" />
          </View>
        </TouchableOpacity>
      </SafeAreaView>

      {/* Image Container - Centered with black background on top and bottom */}
      <View style={styles.imageWrapper}>
        <Image source={image} style={styles.image} resizeMode="contain" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  buttonContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  closeButton: {
    paddingTop: Platform.OS === "ios" ? 8 : 16,
    paddingLeft: 20,
    alignSelf: "flex-start",
  },
  closeButtonCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#000000",
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.9,
        shadowRadius: 6,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  imageWrapper: {
    flex: 1,
    width: width,
    backgroundColor: "#000000",
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: width,
    height: height,
  },
});
