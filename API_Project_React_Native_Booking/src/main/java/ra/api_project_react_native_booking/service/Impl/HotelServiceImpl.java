package ra.api_project_react_native_booking.service.Impl;

import lombok.RequiredArgsConstructor;
import org.hibernate.Hibernate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ra.api_project_react_native_booking.dto.response.HotelResponse;
import ra.api_project_react_native_booking.model.Hotel;
import ra.api_project_react_native_booking.repository.HotelRepository;
import ra.api_project_react_native_booking.service.interfaces.HotelService;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HotelServiceImpl implements HotelService {

    private final HotelRepository hotelRepository;

    @Override
    public List<HotelResponse> getAllHotels() {
        List<Hotel> hotels = hotelRepository.findAll();
        return hotels.stream()
                .map(this::convertToHotelResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<HotelResponse> getTop5BestHotels() {
        Pageable pageable = PageRequest.of(0, 5);
        List<Hotel> hotels = hotelRepository.findTop5ByOrderByStarRatingDesc(pageable);
        return hotels.stream()
                .map(this::convertToHotelResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public HotelResponse getHotelById(Long id) {
        Hotel hotel = hotelRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Hotel not found with id: " + id));
        return convertToHotelResponse(hotel);
    }

    @Override
    public List<HotelResponse> searchHotels(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return getAllHotels();
        }

        // Tìm kiếm theo tên, mô tả, thành phố, địa chỉ
        List<Hotel> hotels = hotelRepository.searchHotels(keyword.toLowerCase());

        return hotels.stream()
                .map(this::convertToHotelResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<HotelResponse> getHotelsByCity(String city) {
        if (city == null || city.trim().isEmpty()) {
            return getAllHotels();
        }

        Pageable pageable = PageRequest.of(0, 50); // Giới hạn 50 khách sạn
        Page<Hotel> hotels = hotelRepository.findByCityContainingIgnoreCase(city, pageable);

        return hotels.getContent().stream()
                .map(this::convertToHotelResponse)
                .collect(Collectors.toList());
    }

    private HotelResponse convertToHotelResponse(Hotel hotel) {
        // Force initialize lazy collections để tránh LazyInitializationException
        Hibernate.initialize(hotel.getReviews());
        
        return HotelResponse.builder()
                .id(hotel.getId())
                .name(hotel.getName())
                .description(hotel.getDescription())
                .address(hotel.getAddress())
                .city(hotel.getCity())
                .country(hotel.getCountry())
                .starRating(hotel.getStarRating())
                .latitude(hotel.getLatitude())
                .longitude(hotel.getLongitude())
                .contactEmail(hotel.getContactEmail())
                .contactPhone(hotel.getContactPhone())
                .imageUrl(hotel.getImageUrl())
                .averageRating(calculateHotelAverageRating(hotel))
                .reviewCount(hotel.getReviews() != null ? (long) hotel.getReviews().size() : 0L)
                .rooms(null) // Không include rooms để tránh circular reference và performance issues
                .build();
    }

    private Double calculateHotelAverageRating(Hotel hotel) {
        if (hotel.getReviews() == null || hotel.getReviews().isEmpty()) {
            return 0.0;
        }

        return hotel.getReviews().stream()
                .mapToInt(review -> review.getRating())
                .average()
                .orElse(0.0);
    }
}