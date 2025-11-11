package ra.api_project_react_native_booking.service.Impl;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import ra.api_project_react_native_booking.dto.request.ReviewRequest;
import ra.api_project_react_native_booking.dto.response.ReviewResponse;
import ra.api_project_react_native_booking.model.Review;
import ra.api_project_react_native_booking.model.User;
import ra.api_project_react_native_booking.repository.ReviewRepository;
import ra.api_project_react_native_booking.repository.UserRepository;
import ra.api_project_react_native_booking.service.interfaces.ReviewService;

@Service
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;

    @Override
    public ReviewResponse addReview(ReviewRequest reviewRequest, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Review review = Review.builder()
                .user(user)
                .rating(reviewRequest.getRating())
                .comment(reviewRequest.getComment())
                .build();

        if (reviewRequest.getHotelId() != null) {
            // Set hotel logic
        }

        if (reviewRequest.getRoomId() != null) {
            // Set room logic
        }

        Review savedReview = reviewRepository.save(review);
        return convertToReviewResponse(savedReview);
    }

    @Override
    public Page<ReviewResponse> getReviewsByRoom(Long roomId, Pageable pageable) {
        Page<Review> reviews = reviewRepository.findByRoomId(roomId, pageable);
        return reviews.map(this::convertToReviewResponse);
    }

    @Override
    public Page<ReviewResponse> getReviewsByHotel(Long hotelId, Pageable pageable) {
        Page<Review> reviews = reviewRepository.findByHotelId(hotelId, pageable);
        return reviews.map(this::convertToReviewResponse);
    }

    @Override
    public Page<ReviewResponse> getReviewsByUser(Long userId, Pageable pageable) {
        Page<Review> reviews = reviewRepository.findByUserId(userId, pageable);
        return reviews.map(this::convertToReviewResponse);
    }

    @Override
    public Double getAverageRatingByRoom(Long roomId) {
        return reviewRepository.findAverageRatingByRoomId(roomId);
    }

    @Override
    public Double getAverageRatingByHotel(Long hotelId) {
        return reviewRepository.findAverageRatingByHotelId(hotelId);
    }

    private ReviewResponse convertToReviewResponse(Review review) {
        return ReviewResponse.builder()
                .id(review.getId())
                .rating(review.getRating())
                .comment(review.getComment())
                .createdAt(review.getCreatedAt())
                .updatedAt(review.getUpdatedAt())
                .build();
    }
}