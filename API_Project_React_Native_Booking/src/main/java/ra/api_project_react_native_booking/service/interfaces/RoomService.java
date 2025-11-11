package ra.api_project_react_native_booking.service.interfaces;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import ra.api_project_react_native_booking.dto.request.RoomFilterRequest;
import ra.api_project_react_native_booking.dto.request.RoomSearchRequest;
import ra.api_project_react_native_booking.dto.response.RoomResponse;

import java.time.LocalDate;
import java.util.List;

public interface RoomService {
    Page<RoomResponse> searchRooms(RoomSearchRequest searchRequest, Pageable pageable);
    Page<RoomResponse> getRoomsByHotel(Long hotelId, Pageable pageable);
    RoomResponse getRoomById(Long id);
    List<RoomResponse> getAvailableRooms(LocalDate checkIn, LocalDate checkOut);
    Page<RoomResponse> filterRooms(RoomFilterRequest filterRequest, Pageable pageable);
    Page<RoomResponse> getRoomsByStatus(Boolean isAvailable, Pageable pageable);
    Page<RoomResponse> getAllRooms(Pageable pageable);
}