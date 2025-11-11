import { APIResponse } from "@/types/auth";
import { ReviewResponse } from "../types/hotel";
import axiosInstance from "../utils/axiosInstance";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Thêm review
export async function addReview(reviewRequest: {
  hotelId?: number;
  roomId?: number;
  rating: number;
  comment?: string;
}): Promise<ReviewResponse> {
  const userId = await AsyncStorage.getItem("userId");
  if (!userId) {
    throw new Error("User not authenticated");
  }

  const response = await axiosInstance.post<APIResponse<ReviewResponse>>(
    "reviews",
    reviewRequest,
    {
      headers: {
        "user-id": userId,
      },
    }
  );
  return response.data.data;
}

// Lấy reviews theo room ID
export async function getReviewsByRoom(
  roomId: number,
  page: number = 0,
  size: number = 10
): Promise<{
  content: ReviewResponse[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}> {
  const response = await axiosInstance.get<
    APIResponse<{
      content: ReviewResponse[];
      totalElements: number;
      totalPages: number;
      number: number;
      size: number;
    }>
  >(`reviews/room/${roomId}`, {
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

// Lấy reviews theo hotel ID
export async function getReviewsByHotel(
  hotelId: number,
  page: number = 0,
  size: number = 10
): Promise<{
  content: ReviewResponse[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}> {
  const response = await axiosInstance.get<
    APIResponse<{
      content: ReviewResponse[];
      totalElements: number;
      totalPages: number;
      number: number;
      size: number;
    }>
  >(`reviews/hotel/${hotelId}`, {
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

// Lấy average rating của room
export async function getAverageRatingByRoom(roomId: number): Promise<number> {
  const response = await axiosInstance.get<APIResponse<number>>(
    `reviews/room/${roomId}/average-rating`
  );
  return response.data.data;
}

// Lấy average rating của hotel
export async function getAverageRatingByHotel(
  hotelId: number
): Promise<number> {
  const response = await axiosInstance.get<APIResponse<number>>(
    `reviews/hotel/${hotelId}/average-rating`
  );
  return response.data.data;
}
