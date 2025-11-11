import { HotelResponse, Hotel, RoomResponse } from "../types/hotel";

// Convert HotelResponse từ API sang Hotel type cho UI
export function convertHotelResponseToHotel(
  hotelResponse: HotelResponse,
  defaultImage?: any
): Hotel {
  // Lấy giá phòng rẻ nhất hoặc giá trung bình
  const rooms = hotelResponse.rooms || [];
  const prices = rooms
    .map((room) => Number(room.price))
    .filter((price) => price > 0);
  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
  const avgPrice = prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : 0;
  const price = minPrice > 0 ? minPrice : avgPrice;

  // Lấy ảnh - ưu tiên hotel imageUrl, sau đó room images, cuối cùng default
  let image = defaultImage;
  if (hotelResponse.imageUrl && hotelResponse.imageUrl.trim() !== "") {
    // Sử dụng hotel imageUrl
    image = { uri: hotelResponse.imageUrl };
  } else if (rooms.length > 0 && rooms[0].images && rooms[0].images.length > 0) {
    // Sử dụng room image đầu tiên
    image = { uri: rooms[0].images[0].imageUrl };
  }

  // Lấy photos từ hotel imageUrl và room images
  const photos: any[] = [];
  if (hotelResponse.imageUrl && hotelResponse.imageUrl.trim() !== "") {
    photos.push({ uri: hotelResponse.imageUrl });
  }
  rooms.forEach((room) => {
    if (room && room.images && room.images.length > 0) {
      room.images.forEach((img) => {
        // Tránh trùng lặp
        if (img && img.imageUrl && !photos.some((p) => p.uri === img.imageUrl)) {
          photos.push({ uri: img.imageUrl });
        }
      });
    }
  });

  return {
    id: hotelResponse.id,
    name: hotelResponse.name,
    location: hotelResponse.city
      ? `${hotelResponse.city}, ${hotelResponse.country || ""}`
      : hotelResponse.address || "",
    price: price,
    rating: hotelResponse.averageRating || 0,
    reviews: hotelResponse.reviewCount || 0,
    image: image || require("../assets/images/anh1.jpg"),
    overview: hotelResponse.description,
    photos: photos.length > 0 ? photos.slice(0, 10) : [],
  };
}

// Convert danh sách HotelResponse
export function convertHotelResponsesToHotels(
  hotelResponses: HotelResponse[],
  defaultImage?: any
): Hotel[] {
  return hotelResponses.map((hr) => convertHotelResponseToHotel(hr, defaultImage));
}

// Lấy image URL từ room (nếu có)
export function getRoomImageUrl(room: RoomResponse): string | null {
  if (room.images && room.images.length > 0) {
    const primaryImage = room.images.find((img) => img.isPrimary);
    return primaryImage
      ? primaryImage.imageUrl
      : room.images[0].imageUrl;
  }
  return null;
}

