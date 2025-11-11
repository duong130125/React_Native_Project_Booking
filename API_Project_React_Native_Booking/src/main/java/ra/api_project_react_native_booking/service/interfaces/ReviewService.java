package ra.api_project_react_native_booking.service.interfaces;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import ra.api_project_react_native_booking.dto.request.ReviewRequest;
import ra.api_project_react_native_booking.dto.response.ReviewResponse;

public interface ReviewService {
    ReviewResponse addReview(ReviewRequest reviewRequest, Long userId);
    Page<ReviewResponse> getReviewsByRoom(Long roomId, Pageable pageable);
    Page<ReviewResponse> getReviewsByHotel(Long hotelId, Pageable pageable);
    Page<ReviewResponse> getReviewsByUser(Long userId, Pageable pageable);
    Double getAverageRatingByRoom(Long roomId);
    Double getAverageRatingByHotel(Long hotelId);
}