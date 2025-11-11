import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  Alert,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

export default function SelectDateScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [showModal, setShowModal] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedStartDate, setSelectedStartDate] = useState<Date | null>(null);
  const [selectedEndDate, setSelectedEndDate] = useState<Date | null>(null);

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const daysOfWeek = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    return days;
  };

  const handleDatePress = (date: Date | null) => {
    if (!date) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) return; // Can't select past dates

    if (!selectedStartDate || (selectedStartDate && selectedEndDate)) {
      setSelectedStartDate(date);
      setSelectedEndDate(null);
    } else if (selectedStartDate && !selectedEndDate) {
      if (date < selectedStartDate) {
        setSelectedStartDate(date);
        setSelectedEndDate(null);
      } else {
        setSelectedEndDate(date);
      }
    }
  };

  const isDateInRange = (date: Date | null) => {
    if (!date || !selectedStartDate) return false;
    if (!selectedEndDate) return false;
    return date >= selectedStartDate && date <= selectedEndDate;
  };

  const isDateSelected = (date: Date | null) => {
    if (!date) return false;
    return (
      date.getTime() === selectedStartDate?.getTime() ||
      date.getTime() === selectedEndDate?.getTime()
    );
  };

  const isDateDisabled = (date: Date | null) => {
    if (!date) return true;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    );
  };

  const goToNextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
    );
  };

  const handleSelectGuest = () => {
    if (!params.roomId || !params.hotelId) {
      Alert.alert("Lỗi", "Thiếu thông tin phòng");
      return;
    }

    setShowModal(false);
    router.push({
      pathname: "/select-guest",
      params: {
        roomId: params.roomId as string,
        hotelId: params.hotelId as string,
        startDate: selectedStartDate?.toISOString(),
        endDate: selectedEndDate?.toISOString(),
      },
    } as any);
  };

  const days = getDaysInMonth(currentMonth);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      {/* Blurred Background */}
      <Image
        source={require("../../assets/images/image-booking.png")}
        style={styles.backgroundImage}
        blurRadius={10}
      />
      <View style={styles.overlay} />

      {/* Date Picker Card */}
      <View style={styles.card}>
        {/* Drag Handle */}
        <View style={styles.dragHandle} />

        {/* Header */}
        <Text style={styles.title}>Select Date</Text>

        {/* Month Navigation */}
        <View style={styles.monthNavigation}>
          <Text style={styles.monthText}>
            {months[currentMonth.getMonth()]}, {currentMonth.getFullYear()}
          </Text>
          <View style={styles.monthButtons}>
            <TouchableOpacity
              onPress={goToPreviousMonth}
              style={styles.monthButton}
            >
              <Ionicons name="chevron-back" size={20} color="#111827" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={goToNextMonth}
              style={styles.monthButton}
            >
              <Ionicons name="chevron-forward" size={20} color="#111827" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Days of Week Header */}
        <View style={styles.daysOfWeekContainer}>
          {daysOfWeek.map((day) => (
            <View key={day} style={styles.dayOfWeek}>
              <Text style={styles.dayOfWeekText}>{day}</Text>
            </View>
          ))}
        </View>

        {/* Calendar Grid */}
        <View style={styles.calendarGrid}>
          {days.map((date, index) => {
            const isDisabled = isDateDisabled(date);
            const isSelected = isDateSelected(date);
            const inRange = isDateInRange(date);
            const isStart = date?.getTime() === selectedStartDate?.getTime();
            const isEnd = date?.getTime() === selectedEndDate?.getTime();

            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dateCell,
                  isDisabled && styles.dateCellDisabled,
                  isSelected && styles.dateCellSelected,
                  inRange && !isSelected && styles.dateCellInRange,
                  isStart && styles.dateCellStart,
                  isEnd && styles.dateCellEnd,
                ]}
                onPress={() => handleDatePress(date)}
                disabled={isDisabled}
                activeOpacity={0.7}
              >
                {date && (
                  <Text
                    style={[
                      styles.dateText,
                      isDisabled && styles.dateTextDisabled,
                      isSelected && styles.dateTextSelected,
                      inRange && !isSelected && styles.dateTextInRange,
                    ]}
                  >
                    {date.getDate()}
                  </Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Select Guest Button */}
        <TouchableOpacity
          style={[
            styles.selectGuestButton,
            (!selectedStartDate || !selectedEndDate) &&
              styles.selectGuestButtonDisabled,
          ]}
          onPress={handleSelectGuest}
          disabled={!selectedStartDate || !selectedEndDate}
          activeOpacity={0.8}
        >
          <Text style={styles.selectGuestButtonText}>Select Guest</Text>
        </TouchableOpacity>
      </View>
    </View>
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
  monthNavigation: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  monthText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  monthButtons: {
    flexDirection: "row",
    gap: 12,
  },
  monthButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  daysOfWeekContainer: {
    flexDirection: "row",
    marginBottom: 12,
  },
  dayOfWeek: {
    flex: 1,
    alignItems: "center",
  },
  dayOfWeekText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 24,
  },
  dateCell: {
    width: width / 7 - 24 / 7,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    marginBottom: 8,
  },
  dateCellDisabled: {
    opacity: 0.3,
  },
  dateCellSelected: {
    backgroundColor: "#4F46E5",
  },
  dateCellInRange: {
    backgroundColor: "#EEF2FF",
  },
  dateCellStart: {
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  },
  dateCellEnd: {
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
  },
  dateText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#111827",
  },
  dateTextDisabled: {
    color: "#9CA3AF",
  },
  dateTextSelected: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  dateTextInRange: {
    color: "#4F46E5",
  },
  selectGuestButton: {
    backgroundColor: "#4F46E5",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  selectGuestButtonDisabled: {
    backgroundColor: "#D1D5DB",
  },
  selectGuestButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
