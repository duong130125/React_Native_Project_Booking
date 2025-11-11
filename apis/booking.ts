import AsyncStorage from "@react-native-async-storage/async-storage";
import { BookingResponse } from "../types/hotel";
import axiosInstance from "../utils/axiosInstance";
import { APIResponse } from "@/types/auth";

// Tạo booking mới
export async function createBooking(bookingRequest: {
  roomId: number;
  checkInDate: string;
  checkOutDate: string;
  guests: number;
  specialRequests?: string;
}): Promise<BookingResponse> {
  // Lấy userId từ token hoặc AsyncStorage
  const userId = await AsyncStorage.getItem("userId");
  if (!userId) {
    throw new Error("User not authenticated");
  }

  const response = await axiosInstance.post<APIResponse<BookingResponse>>(
    "bookings",
    bookingRequest,
    {
      headers: {
        "user-id": userId,
      },
    }
  );
  return response.data.data;
}

// Lấy booking theo ID
export async function getBookingById(id: number): Promise<BookingResponse> {
  const response = await axiosInstance.get<APIResponse<BookingResponse>>(
    `bookings/${id}`
  );
  return response.data.data;
}

// Lấy booking theo booking code
export async function getBookingByCode(
  bookingCode: string
): Promise<BookingResponse> {
  const response = await axiosInstance.get<APIResponse<BookingResponse>>(
    `bookings/code/${bookingCode}`
  );
  return response.data.data;
}

// Lấy bookings của user
export async function getUserBookings(
  userId: number,
  page: number = 0,
  size: number = 10
): Promise<{
  content: BookingResponse[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}> {
  const response = await axiosInstance.get<
    APIResponse<{
      content: BookingResponse[];
      totalElements: number;
      totalPages: number;
      number: number;
      size: number;
    }>
  >(`bookings/user/${userId}`, {
    params: { page, size },
  });
  const data = response.data.data;
  return {
    content: data.content,
    totalElements: data.totalElements,
    totalPages: data.totalPages,
    page: data.number,
    size: data.size,
  };
}

// Lấy tất cả bookings của user (không phân trang)
export async function getAllUserBookings(
  userId: number
): Promise<BookingResponse[]> {
  const response = await axiosInstance.get<APIResponse<BookingResponse[]>>(
    `bookings/user/${userId}/all`
  );
  return response.data.data;
}

// Lấy my bookings (sử dụng user-id từ header)
export async function getMyBookings(
  page: number = 0,
  size: number = 10
): Promise<{
  content: BookingResponse[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}> {
  const userId = await AsyncStorage.getItem("userId");
  if (!userId) {
    throw new Error("User not authenticated");
  }

  const response = await axiosInstance.get<
    APIResponse<{
      content: BookingResponse[];
      totalElements: number;
      totalPages: number;
      number: number;
      size: number;
    }>
  >("bookings/my-bookings", {
    params: { page, size },
    headers: {
      "user-id": userId,
    },
  });
  const data = response.data.data;
  return {
    content: data.content,
    totalElements: data.totalElements,
    totalPages: data.totalPages,
    page: data.number,
    size: data.size,
  };
}

// Lấy upcoming bookings
export async function getUpcomingBookings(): Promise<BookingResponse[]> {
  const userId = await AsyncStorage.getItem("userId");
  if (!userId) {
    throw new Error("User not authenticated");
  }

  const response = await axiosInstance.get<APIResponse<BookingResponse[]>>(
    "bookings/upcoming",
    {
      headers: {
        "user-id": userId,
      },
    }
  );
  return response.data.data;
}

// Cập nhật booking status
export async function updateBookingStatus(
  bookingId: number,
  status:
    | "PENDING"
    | "CONFIRMED"
    | "CHECKED_IN"
    | "CHECKED_OUT"
    | "CANCELLED"
    | "NO_SHOW"
): Promise<BookingResponse> {
  const response = await axiosInstance.put<APIResponse<BookingResponse>>(
    `bookings/${bookingId}/status`,
    null,
    {
      params: { status },
    }
  );
  return response.data.data;
}

// Hủy booking
export async function cancelBooking(
  bookingId: number,
  reason?: string
): Promise<BookingResponse> {
  const response = await axiosInstance.put<APIResponse<BookingResponse>>(
    `bookings/${bookingId}/cancel`,
    null,
    {
      params: reason ? { reason } : {},
    }
  );
  return response.data.data;
}
