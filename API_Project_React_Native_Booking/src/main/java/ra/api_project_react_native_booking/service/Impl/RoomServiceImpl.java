package ra.api_project_react_native_booking.service.Impl;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ra.api_project_react_native_booking.dto.request.RoomFilterRequest;
import ra.api_project_react_native_booking.dto.request.RoomSearchRequest;
import ra.api_project_react_native_booking.dto.response.AmenityResponse;
import ra.api_project_react_native_booking.dto.response.RoomImageResponse;
import ra.api_project_react_native_booking.dto.response.RoomResponse;
import ra.api_project_react_native_booking.dto.response.RoomTypeResponse;
import ra.api_project_react_native_booking.model.Room;
import ra.api_project_react_native_booking.repository.RoomRepository;
import ra.api_project_react_native_booking.service.interfaces.RoomService;
import org.hibernate.Hibernate;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RoomServiceImpl implements RoomService {

    private final RoomRepository roomRepository;

    @Override
    public Page<RoomResponse> searchRooms(RoomSearchRequest searchRequest, Pageable pageable) {
        Page<Room> rooms = roomRepository.searchRooms(
                searchRequest.getCity() != null ? null : Long.valueOf(searchRequest.getCity()),
                searchRequest.getRoomTypeId(),
                searchRequest.getMinPrice(),
                searchRequest.getMaxPrice(),
                searchRequest.getMinCapacity(),
                pageable
        );
        return rooms.map(this::convertToRoomResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<RoomResponse> getRoomsByHotel(Long hotelId, Pageable pageable) {
        Page<Room> rooms = roomRepository.findByHotelId(hotelId, pageable);
        return rooms.map(this::convertToRoomResponse);
    }

    @Override
    public RoomResponse getRoomById(Long id) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Room not found with id: " + id));
        return convertToRoomResponse(room);
    }

    @Override
    public List<RoomResponse> getAvailableRooms(LocalDate checkIn, LocalDate checkOut) {
        List<Room> rooms = roomRepository.findAvailableRooms(checkIn, checkOut);
        return rooms.stream()
                .map(this::convertToRoomResponse)
                .collect(Collectors.toList());
    }

    @Override
    public Page<RoomResponse> filterRooms(RoomFilterRequest filterRequest, Pageable pageable) {
        Page<Room> rooms = roomRepository.searchRooms(
                filterRequest.getHotelId(),
                filterRequest.getRoomTypeId(),
                filterRequest.getMinPrice(),
                filterRequest.getMaxPrice(),
                filterRequest.getMinCapacity(),
                pageable
        );
        return rooms.map(this::convertToRoomResponse);
    }

    @Override
    public Page<RoomResponse> getRoomsByStatus(Boolean isAvailable, Pageable pageable) {
        Page<Room> rooms = roomRepository.findByIsAvailable(isAvailable, pageable);
        return rooms.map(this::convertToRoomResponse);
    }

    @Override
    public Page<RoomResponse> getAllRooms(Pageable pageable) {
        Page<Room> rooms = roomRepository.findAll(pageable);
        return rooms.map(this::convertToRoomResponse);
    }

    private RoomResponse convertToRoomResponse(Room room) {
        // Force initialize lazy collections để tránh LazyInitializationException
        Hibernate.initialize(room.getImages());
        Hibernate.initialize(room.getAmenities());
        Hibernate.initialize(room.getReviews());
        Hibernate.initialize(room.getRoomType());
        
        // Convert RoomType to DTO
        RoomTypeResponse roomTypeResponse = null;
        if (room.getRoomType() != null) {
            roomTypeResponse = RoomTypeResponse.builder()
                    .id(room.getRoomType().getId())
                    .name(room.getRoomType().getName())
                    .description(room.getRoomType().getDescription())
                    .build();
        }
        
        return RoomResponse.builder()
                .id(room.getId())
                .roomNumber(room.getRoomNumber())
                .hotel(null) // Không include hotel để tránh circular reference
                .roomType(roomTypeResponse)
                .price(room.getPrice())
                .discountPrice(room.getDiscountPrice())
                .capacity(room.getCapacity())
                .roomSize(room.getRoomSize())
                .isAvailable(room.getIsAvailable())
                .description(room.getDescription())
                .averageRating(calculateRoomAverageRating(room))
                .images(room.getImages() != null ? room.getImages().stream()
                        .map(image -> RoomImageResponse.builder()
                                .id(image.getId())
                                .imageUrl(image.getImageUrl())
                                .isPrimary(image.getIsPrimary())
                                .build())
                        .collect(Collectors.toList()) : List.of())
                .amenities(room.getAmenities() != null ? room.getAmenities().stream()
                        .map(amenity -> AmenityResponse.builder()
                                .id(amenity.getId())
                                .name(amenity.getName())
                                .icon(amenity.getIcon())
                                .description(amenity.getDescription())
                                .build())
                        .collect(Collectors.toList()) : List.of())
                .reviewCount(room.getReviews() != null ? (long) room.getReviews().size() : 0L)
                .build();
    }
    
    private Double calculateRoomAverageRating(Room room) {
        if (room.getReviews() == null || room.getReviews().isEmpty()) {
            return 0.0;
        }
        return room.getReviews().stream()
                .mapToInt(review -> review.getRating())
                .average()
                .orElse(0.0);
    }
}