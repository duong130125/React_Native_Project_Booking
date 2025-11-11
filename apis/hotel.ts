import { APIResponse } from "@/types/auth";
import { HotelResponse } from "../types/hotel";
import axiosInstance from "../utils/axiosInstance";

// Lấy danh sách best hotels
export async function getBestHotels(): Promise<HotelResponse[]> {
  const response = await axiosInstance.get<APIResponse<HotelResponse[]>>(
    "hotels/best"
  );
  return response.data.data;
}

// Lấy chi tiết hotel theo ID
export async function getHotelById(id: number): Promise<HotelResponse> {
  const response = await axiosInstance.get<APIResponse<HotelResponse>>(
    `hotels/${id}`
  );
  return response.data.data;
}

// Tìm kiếm hotels theo keyword
export async function searchHotels(keyword: string): Promise<HotelResponse[]> {
  const response = await axiosInstance.get<APIResponse<HotelResponse[]>>(
    "hotels/search",
    {
      params: { keyword },
    }
  );
  return response.data.data;
}

// Lấy hotels theo city
export async function getHotelsByCity(city: string): Promise<HotelResponse[]> {
  const response = await axiosInstance.get<APIResponse<HotelResponse[]>>(
    `hotels/city/${city}`
  );
  return response.data.data;
}

// Lấy tất cả hotels
export async function getAllHotels(): Promise<HotelResponse[]> {
  const response = await axiosInstance.get<APIResponse<HotelResponse[]>>(
    "hotels"
  );
  return response.data.data;
}

// Lấy featured hotels
export async function getFeaturedHotels(): Promise<HotelResponse[]> {
  const response = await axiosInstance.get<APIResponse<HotelResponse[]>>(
    "hotels/featured"
  );
  return response.data.data;
}

// Lấy top rated hotels
export async function getTopRatedHotels(): Promise<HotelResponse[]> {
  const response = await axiosInstance.get<APIResponse<HotelResponse[]>>(
    "hotels/top-rated"
  );
  return response.data.data;
}

// Lọc hotels theo rating và city
export async function filterHotels(params: {
  minRating?: number;
  maxRating?: number;
  city?: string;
}): Promise<HotelResponse[]> {
  const response = await axiosInstance.get<APIResponse<HotelResponse[]>>(
    "hotels/filter",
    {
      params,
    }
  );
  return response.data.data;
}

// Lấy danh sách các cities có hotels (từ danh sách hotels)
export async function getCities(): Promise<string[]> {
  try {
    const hotels = await getAllHotels();
    const cities = new Set<string>();
    hotels.forEach((hotel) => {
      if (hotel.city) {
        cities.add(hotel.city);
      }
    });
    return Array.from(cities).sort();
  } catch (error) {
    console.error("Error getting cities:", error);
    return [];
  }
}
