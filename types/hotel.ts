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
