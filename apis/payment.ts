import axiosInstance from "../utils/axiosInstance";
import { APIResponse } from "../types/api";
import {
  PaymentCardRequest,
  PaymentCardResponse,
  PaymentRequest,
  PaymentResponse,
} from "../types/payment";
import AsyncStorage from "@react-native-async-storage/async-storage";

// ==================== Payment Card APIs ====================

/**
 * Lấy danh sách thẻ của user
 */
export async function getMyCards(): Promise<PaymentCardResponse[]> {
  const userId = await AsyncStorage.getItem("userId");
  if (!userId) {
    throw new Error("User not logged in");
  }

  const response = await axiosInstance.get<APIResponse<PaymentCardResponse[]>>(
    `payments/cards`,
    {
      headers: {
        "user-id": userId,
      },
    }
  );
  return response.data.data;
}

/**
 * Thêm thẻ mới
 */
export async function createCard(
  request: PaymentCardRequest
): Promise<PaymentCardResponse> {
  const userId = await AsyncStorage.getItem("userId");
  if (!userId) {
    throw new Error("User not logged in");
  }

  const response = await axiosInstance.post<APIResponse<PaymentCardResponse>>(
    `payments/cards`,
    request,
    {
      headers: {
        "user-id": userId,
      },
    }
  );
  return response.data.data;
}

/**
 * Cập nhật thẻ
 */
export async function updateCard(
  cardId: number,
  request: PaymentCardRequest
): Promise<PaymentCardResponse> {
  const userId = await AsyncStorage.getItem("userId");
  if (!userId) {
    throw new Error("User not logged in");
  }

  const response = await axiosInstance.put<APIResponse<PaymentCardResponse>>(
    `payments/cards/${cardId}`,
    request,
    {
      headers: {
        "user-id": userId,
      },
    }
  );
  return response.data.data;
}

/**
 * Xóa thẻ
 */
export async function deleteCard(cardId: number): Promise<void> {
  const userId = await AsyncStorage.getItem("userId");
  if (!userId) {
    throw new Error("User not logged in");
  }

  await axiosInstance.delete(`payments/cards/${cardId}`, {
    headers: {
      "user-id": userId,
    },
  });
}

/**
 * Đặt thẻ làm mặc định
 */
export async function setDefaultCard(
  cardId: number
): Promise<PaymentCardResponse> {
  const userId = await AsyncStorage.getItem("userId");
  if (!userId) {
    throw new Error("User not logged in");
  }

  const response = await axiosInstance.put<APIResponse<PaymentCardResponse>>(
    `payments/cards/${cardId}/set-default`,
    {},
    {
      headers: {
        "user-id": userId,
      },
    }
  );
  return response.data.data;
}

// ==================== Payment APIs ====================

/**
 * Thanh toán booking
 */
export async function payBooking(
  request: PaymentRequest
): Promise<PaymentResponse> {
  const userId = await AsyncStorage.getItem("userId");
  if (!userId) {
    throw new Error("User not logged in");
  }

  const response = await axiosInstance.post<APIResponse<PaymentResponse>>(
    `payments/pay`,
    request,
    {
      headers: {
        "user-id": userId,
      },
    }
  );
  return response.data.data;
}

/**
 * Lấy danh sách thanh toán của user
 */
export async function getMyPayments(): Promise<PaymentResponse[]> {
  const userId = await AsyncStorage.getItem("userId");
  if (!userId) {
    throw new Error("User not logged in");
  }

  const response = await axiosInstance.get<APIResponse<PaymentResponse[]>>(
    `payments/my-payments`,
    {
      headers: {
        "user-id": userId,
      },
    }
  );
  return response.data.data;
}

/**
 * Lấy thông tin thanh toán theo booking ID
 */
export async function getPaymentByBookingId(
  bookingId: number
): Promise<PaymentResponse> {
  const response = await axiosInstance.get<APIResponse<PaymentResponse>>(
    `payments/booking/${bookingId}`
  );
  return response.data.data;
}

