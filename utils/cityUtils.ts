import { City, HotelResponse } from "../types/hotel";

// Convert hotels thành cities với image từ hotel imageUrl
export function getCitiesFromHotels(
  hotels: HotelResponse[],
  defaultImages: any[]
): City[] {
  const cityMap = new Map<string, HotelResponse[]>();

  // Nhóm hotels theo city
  hotels.forEach((hotel) => {
    if (hotel.city) {
      if (!cityMap.has(hotel.city)) {
        cityMap.set(hotel.city, []);
      }
      cityMap.get(hotel.city)!.push(hotel);
    }
  });

  // Convert thành City array
  const cities: City[] = [];
  let imageIndex = 0;

  cityMap.forEach((hotelsInCity, cityName) => {
    // Lấy image từ hotel đầu tiên có imageUrl, nếu không có thì dùng default
    const firstHotelWithImage = hotelsInCity.find(
      (hotel) => hotel && hotel.imageUrl && hotel.imageUrl.trim() !== ""
    );

    let cityImage;
    if (firstHotelWithImage && firstHotelWithImage.imageUrl) {
      // Sử dụng imageUrl từ hotel
      cityImage = { uri: firstHotelWithImage.imageUrl };
    } else {
      // Fallback về default image
      cityImage = defaultImages[imageIndex % defaultImages.length];
    }

    cities.push({
      id: cities.length + 1,
      name: cityName,
      image: cityImage,
    });
    imageIndex++;
  });

  return cities.sort((a, b) => a.name.localeCompare(b.name));
}
