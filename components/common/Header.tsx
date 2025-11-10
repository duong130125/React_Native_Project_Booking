import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colors } from "../../constants/colors";
import { Spacing } from "../../constants/spacing";
import { Typography } from "../../constants/typography";

interface HeaderProps {
  showMenu?: boolean;
  showSearch?: boolean;
  onSearchPress?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  showMenu = true,
  showSearch = true,
  onSearchPress,
}) => {
  const router = useRouter();

  const handleSearchPress = () => {
    if (onSearchPress) {
      onSearchPress();
    } else {
      router.push("/search");
    }
  };

  return (
    <View style={styles.header}>
      {/* Menu Icon and Logo Row */}
      <View style={styles.headerTopRow}>
        {showMenu && (
          <TouchableOpacity style={styles.menuIcon}>
            <View style={styles.menuIconContainer}>
              <Ionicons name="grid-outline" size={24} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
        )}

        <View style={styles.logoContainer}>
          <View style={styles.logoWrapper}>
            <View style={styles.logoCurve} />
            <Text style={styles.logoTextLight}>live</Text>
            <Text style={styles.logoTextWhite}> Green</Text>
          </View>
        </View>
      </View>

      {/* Search Bar */}
      {showSearch && (
        <View style={styles.searchContainer}>
          <TouchableOpacity
            style={styles.searchBar}
            onPress={handleSearchPress}
            activeOpacity={0.8}
          >
            <Ionicons name="search-outline" size={20} color="#6B7280" />
            <Text style={styles.searchPlaceholder}>Search</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterButton}>
            <View style={styles.filterIcon}>
              <View style={styles.filterLine}>
                <View style={styles.filterDot} />
              </View>
              <View style={styles.filterLine}>
                <View style={styles.filterDot} />
              </View>
            </View>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: Colors.secondary,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xl,
    paddingHorizontal: Spacing.xl,
    borderBottomLeftRadius: Spacing.xxl,
    borderBottomRightRadius: Spacing.xxl,
    overflow: "hidden",
  },
  headerTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    marginBottom: Spacing.xl,
    width: "100%",
    position: "relative",
  },
  menuIcon: {
    alignSelf: "center",
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: Spacing.md,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  logoContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 0,
  },
  logoWrapper: {
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
  },
  logoCurve: {
    position: "absolute",
    top: -8,
    left: 0,
    width: 40,
    height: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 2,
    borderBottomWidth: 0,
    borderColor: "#FFFFFF",
  },
  logoTextLight: {
    fontSize: Typography.xxl,
    fontWeight: Typography.semiBold,
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  logoTextWhite: {
    fontSize: Typography.xxl,
    fontWeight: Typography.semiBold,
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    width: "100%",
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.md,
    minHeight: 52,
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: Typography.md,
    color: "#9CA3AF",
    marginLeft: Spacing.md,
  },
  filterButton: {
    width: 52,
    height: 52,
    backgroundColor: Colors.secondaryDark,
    borderRadius: Spacing.md,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.25)",
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  filterIcon: {
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  filterLine: {
    width: 20,
    height: 1.5,
    backgroundColor: "#FFFFFF",
    borderRadius: 1,
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  filterDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: "transparent",
    position: "absolute",
    borderWidth: 1.5,
    borderColor: "#FFFFFF",
  },
});
