package ra.api_project_react_native_booking.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import ra.api_project_react_native_booking.model.Hotel;

import java.util.List;

@Repository
public interface HotelRepository extends JpaRepository<Hotel, Long> {

    // Top 5 khách sạn có số sao cao nhất
    @Query("SELECT h FROM Hotel h ORDER BY h.starRating DESC, h.createdAt DESC")
    List<Hotel> findTop5ByOrderByStarRatingDesc(Pageable pageable);

    // Tìm khách sạn theo thành phố
    Page<Hotel> findByCityContainingIgnoreCase(String city, Pageable pageable);

    // Tìm khách sạn theo tên
    Page<Hotel> findByNameContainingIgnoreCase(String name, Pageable pageable);

    // Tìm kiếm đa điều kiện
    @Query("SELECT h FROM Hotel h WHERE " +
            "LOWER(h.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(h.description) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(h.city) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(h.address) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(h.country) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Hotel> searchHotels(@Param("keyword") String keyword);

    // Tìm khách sạn theo số sao
    Page<Hotel> findByStarRatingGreaterThanEqual(Integer minRating, Pageable pageable);

    // Tìm khách sạn theo thành phố và số sao
    @Query("SELECT h FROM Hotel h WHERE LOWER(h.city) LIKE LOWER(CONCAT('%', :city, '%')) AND h.starRating >= :minRating")
    Page<Hotel> findByCityAndMinRating(@Param("city") String city,
                                       @Param("minRating") Integer minRating,
                                       Pageable pageable);
}