package ra.api_project_react_native_booking.service.interfaces;

import ra.api_project_react_native_booking.dto.response.HotelResponse;

import java.util.List;

public interface HotelService {
    List<HotelResponse> getAllHotels();
    List<HotelResponse> getTop5BestHotels();
    HotelResponse getHotelById(Long id);
    List<HotelResponse> searchHotels(String keyword);
    List<HotelResponse> getHotelsByCity(String city);
}