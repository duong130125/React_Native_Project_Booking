package ra.api_project_react_native_booking.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import ra.api_project_react_native_booking.model.Room;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface RoomRepository extends JpaRepository<Room, Long> {

    // Tìm phòng theo khách sạn
    Page<Room> findByHotelId(Long hotelId, Pageable pageable);

    // Tìm phòng theo trạng thái available
    Page<Room> findByIsAvailable(Boolean isAvailable, Pageable pageable);

    // Tìm phòng theo khoảng giá
    Page<Room> findByPriceBetween(BigDecimal minPrice, BigDecimal maxPrice, Pageable pageable);

    // Tìm phòng theo số khách
    Page<Room> findByCapacityGreaterThanEqual(Integer minCapacity, Pageable pageable);

    // Tìm phòng theo loại phòng
    Page<Room> findByRoomTypeId(Long roomTypeId, Pageable pageable);

    // Tìm phòng available trong khoảng thời gian
    @Query("SELECT r FROM Room r WHERE r.id NOT IN " +
            "(SELECT b.room.id FROM Booking b WHERE " +
            "b.status IN ('CONFIRMED', 'CHECKED_IN') AND " +
            "((b.checkInDate BETWEEN :checkIn AND :checkOut) OR " +
            "(b.checkOutDate BETWEEN :checkIn AND :checkOut) OR " +
            "(b.checkInDate <= :checkIn AND b.checkOutDate >= :checkOut))) " +
            "AND r.isAvailable = true")
    List<Room> findAvailableRooms(@Param("checkIn") LocalDate checkIn,
                                  @Param("checkOut") LocalDate checkOut);

    // Tìm kiếm và lọc phòng nâng cao
    @Query("SELECT r FROM Room r WHERE " +
            "(:hotelId IS NULL OR r.hotel.id = :hotelId) AND " +
            "(:roomTypeId IS NULL OR r.roomType.id = :roomTypeId) AND " +
            "(:minPrice IS NULL OR r.price >= :minPrice) AND " +
            "(:maxPrice IS NULL OR r.price <= :maxPrice) AND " +
            "(:minCapacity IS NULL OR r.capacity >= :minCapacity) AND " +
            "r.isAvailable = true")
    Page<Room> searchRooms(@Param("hotelId") Long hotelId,
                           @Param("roomTypeId") Long roomTypeId,
                           @Param("minPrice") BigDecimal minPrice,
                           @Param("maxPrice") BigDecimal maxPrice,
                           @Param("minCapacity") Integer minCapacity,
                           Pageable pageable);
}