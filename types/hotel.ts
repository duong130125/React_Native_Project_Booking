// API Response Types (matching backend DTOs)
export interface RoomType {
  id: number;
  name: string;
  description?: string;
}

export interface RoomImage {
  id: number;
  imageUrl: string;
  isPrimary: boolean;
}

export interface HotelImage {
  id: number;
  imageUrl: string;
  isPrimary: boolean;
}

export interface Amenity {
  id: number;
  name: string;
  icon?: string;
  description?: string;
}

export interface HotelResponse {
  id: number;
  name: string;
  description?: string;
  address?: string;
  city?: string;
  country?: string;
  starRating?: number;
  latitude?: number;
  longitude?: number;
  contactEmail?: string;
  contactPhone?: string;
  imageUrl?: string;
  averageRating?: number;
  reviewCount?: number;
  rooms?: RoomResponse[];
  images?: HotelImage[];
}

export interface RoomResponse {
  id: number;
  roomNumber: string;
  hotel?: HotelResponse;
  roomType?: RoomType;
  price: number;
  discountPrice?: number;
  capacity?: number;
  roomSize?: number;
  isAvailable?: boolean;
  description?: string;
  averageRating?: number;
  images?: RoomImage[];
  amenities?: Amenity[];
  reviewCount?: number;
}

export interface BookingResponse {
  id: number;
  bookingCode: string;
  user?: any; // UserResponse
  room?: RoomResponse;
  checkInDate: string;
  checkOutDate: string;
  guests?: number;
  totalPrice: number;
  status: "PENDING" | "CONFIRMED" | "CHECKED_IN" | "CHECKED_OUT" | "CANCELLED" | "NO_SHOW";
  specialRequests?: string;
  payment?: any; // PaymentResponse
  createdAt?: string;
  updatedAt?: string;
}

export interface ReviewResponse {
  id: number;
  user?: any; // UserResponse
  hotel?: HotelResponse;
  room?: RoomResponse;
  rating: number;
  comment?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Frontend Types (for UI compatibility)
export interface Hotel {
  id: number;
  name: string;
  location: string;
  price: number;
  rating: number;
  reviews: number;
  image: any;
  isFavorite?: boolean;
  overview?: string;
  photos?: any[];
  host?: {
    name: string;
    avatar: any;
  };
  guests?: number;
  bedrooms?: number;
  beds?: number;
  bathrooms?: number;
}

export interface City {
  id: number;
  name: string;
  image: any;
}

export interface Booking {
  id: string;
  bookingId: string;
  bookingDate: string;
  checkIn: string;
  checkOut: string;
  hotelName: string;
  location: string;
  rating: number;
  reviews: number;
  image: any;
  isUpcoming: boolean;
}

export interface Notification {
  id: string;
  type: "message" | "bookmark" | "promotion" | "password" | "booking";
  title: string;
  description: string;
  date: string;
  image?: any;
  icon?: string;
  iconColor?: string;
  iconBgColor?: string;
  createdAt?: string;
  hotelId?: string;
}

export interface Bookmark {
  id: string;
  hotelId: string;
  hotelName: string;
  location: string;
  rating: number;
  reviews: number;
  price: number;
  image: any;
  savedAt: string;
}
