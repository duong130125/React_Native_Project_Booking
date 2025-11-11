package ra.api_project_react_native_booking.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import ra.api_project_react_native_booking.model.Review;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    // Tìm review theo phòng
    Page<Review> findByRoomId(Long roomId, Pageable pageable);

    // Tìm review theo khách sạn
    Page<Review> findByHotelId(Long hotelId, Pageable pageable);

    // Tìm review theo user
    Page<Review> findByUserId(Long userId, Pageable pageable);

    // Tính rating trung bình của phòng
    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.room.id = :roomId")
    Double findAverageRatingByRoomId(@Param("roomId") Long roomId);

    // Tính rating trung bình của khách sạn
    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.hotel.id = :hotelId")
    Double findAverageRatingByHotelId(@Param("hotelId") Long hotelId);

    // Lấy review mới nhất
    List<Review> findTop5ByRoomIdOrderByCreatedAtDesc(Long roomId);
}