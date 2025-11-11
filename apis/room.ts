import { APIResponse } from "@/types/auth";
import { RoomResponse } from "../types/hotel";
import axiosInstance from "../utils/axiosInstance";

// Tìm kiếm rooms
export async function searchRooms(params: {
  city?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  roomTypeId?: number;
  minPrice?: number;
  maxPrice?: number;
  minCapacity?: number;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
}): Promise<{
  content: RoomResponse[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}> {
  const response = await axiosInstance.get<
    APIResponse<{
      content: RoomResponse[];
      totalElements: number;
      totalPages: number;
      number: number;
      size: number;
    }>
  >("rooms/search", {
    params,
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

// Lấy rooms theo hotel ID
export async function getRoomsByHotel(
  hotelId: number,
  page: number = 0,
  size: number = 10
): Promise<{
  content: RoomResponse[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}> {
  const response = await axiosInstance.get<
    APIResponse<{
      content: RoomResponse[];
      totalElements: number;
      totalPages: number;
      number: number;
      size: number;
    }>
  >(`rooms/hotel/${hotelId}`, {
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

// Lấy chi tiết room theo ID
export async function getRoomById(id: number): Promise<RoomResponse> {
  const response = await axiosInstance.get<APIResponse<RoomResponse>>(
    `rooms/${id}`
  );
  return response.data.data;
}

// Lấy available rooms
export async function getAvailableRooms(
  checkIn: string,
  checkOut: string
): Promise<RoomResponse[]> {
  const response = await axiosInstance.get<APIResponse<RoomResponse[]>>(
    "rooms/available",
    {
      params: { checkIn, checkOut },
    }
  );
  return response.data.data;
}

// Lấy featured rooms
export async function getFeaturedRooms(): Promise<RoomResponse[]> {
  const response = await axiosInstance.get<APIResponse<RoomResponse[]>>(
    "rooms/featured"
  );
  return response.data.data;
}
