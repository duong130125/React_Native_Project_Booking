package ra.api_project_react_native_booking.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ra.api_project_react_native_booking.dto.request.ReviewRequest;
import ra.api_project_react_native_booking.dto.response.APIResponse;
import ra.api_project_react_native_booking.dto.response.ReviewResponse;
import ra.api_project_react_native_booking.service.interfaces.ReviewService;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/v1/reviews")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping
    public ResponseEntity<APIResponse<ReviewResponse>> addReview(
            @Valid @RequestBody ReviewRequest reviewRequest,
            @RequestHeader("user-id") Long userId) {

        ReviewResponse review = reviewService.addReview(reviewRequest, userId);

        return ResponseEntity.status(HttpStatus.CREATED).body(
                APIResponse.<ReviewResponse>builder()
                        .success(true)
                        .message("Review added successfully")
                        .data(review)
                        .status(HttpStatus.CREATED)
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }

    @GetMapping("/room/{roomId}")
    public ResponseEntity<APIResponse<Page<ReviewResponse>>> getReviewsByRoom(
            @PathVariable Long roomId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<ReviewResponse> reviews = reviewService.getReviewsByRoom(roomId, pageable);

        return ResponseEntity.ok(
                APIResponse.<Page<ReviewResponse>>builder()
                        .success(true)
                        .message("Room reviews retrieved successfully")
                        .data(reviews)
                        .status(HttpStatus.OK)
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }

    @GetMapping("/hotel/{hotelId}")
    public ResponseEntity<APIResponse<Page<ReviewResponse>>> getReviewsByHotel(
            @PathVariable Long hotelId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<ReviewResponse> reviews = reviewService.getReviewsByHotel(hotelId, pageable);

        return ResponseEntity.ok(
                APIResponse.<Page<ReviewResponse>>builder()
                        .success(true)
                        .message("Hotel reviews retrieved successfully")
                        .data(reviews)
                        .status(HttpStatus.OK)
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<APIResponse<Page<ReviewResponse>>> getReviewsByUser(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<ReviewResponse> reviews = reviewService.getReviewsByUser(userId, pageable);

        return ResponseEntity.ok(
                APIResponse.<Page<ReviewResponse>>builder()
                        .success(true)
                        .message("User reviews retrieved successfully")
                        .data(reviews)
                        .status(HttpStatus.OK)
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }

    @GetMapping("/room/{roomId}/average-rating")
    public ResponseEntity<APIResponse<Double>> getAverageRatingByRoom(@PathVariable Long roomId) {
        Double averageRating = reviewService.getAverageRatingByRoom(roomId);

        return ResponseEntity.ok(
                APIResponse.<Double>builder()
                        .success(true)
                        .message("Average room rating calculated successfully")
                        .data(averageRating)
                        .status(HttpStatus.OK)
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }

    @GetMapping("/hotel/{hotelId}/average-rating")
    public ResponseEntity<APIResponse<Double>> getAverageRatingByHotel(@PathVariable Long hotelId) {
        Double averageRating = reviewService.getAverageRatingByHotel(hotelId);

        return ResponseEntity.ok(
                APIResponse.<Double>builder()
                        .success(true)
                        .message("Average hotel rating calculated successfully")
                        .data(averageRating)
                        .status(HttpStatus.OK)
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }

    @GetMapping("/{reviewId}")
    public ResponseEntity<APIResponse<ReviewResponse>> getReviewById(@PathVariable Long reviewId) {
        // Giả sử có service method để lấy review theo ID
        // ReviewResponse review = reviewService.getReviewById(reviewId);

        return ResponseEntity.ok(
                APIResponse.<ReviewResponse>builder()
                        .success(true)
                        .message("Get review by ID - Implementation pending")
                        .data(null)
                        .status(HttpStatus.OK)
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }

    @PutMapping("/{reviewId}")
    public ResponseEntity<APIResponse<ReviewResponse>> updateReview(
            @PathVariable Long reviewId,
            @Valid @RequestBody ReviewRequest reviewRequest,
            @RequestHeader("user-id") Long userId) {

        // Giả sử có service method để update review
        // ReviewResponse updatedReview = reviewService.updateReview(reviewId, reviewRequest, userId);

        return ResponseEntity.ok(
                APIResponse.<ReviewResponse>builder()
                        .success(true)
                        .message("Update review - Implementation pending")
                        .data(null)
                        .status(HttpStatus.OK)
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }

    @DeleteMapping("/{reviewId}")
    public ResponseEntity<APIResponse<String>> deleteReview(
            @PathVariable Long reviewId,
            @RequestHeader("user-id") Long userId) {

        // Giả sử có service method để xóa review
        // reviewService.deleteReview(reviewId, userId);

        return ResponseEntity.ok(
                APIResponse.<String>builder()
                        .success(true)
                        .message("Review deleted successfully")
                        .data("Review with ID " + reviewId + " has been deleted")
                        .status(HttpStatus.OK)
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }

    @GetMapping("/recent")
    public ResponseEntity<APIResponse<Page<ReviewResponse>>> getRecentReviews(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size);
        // Giả sử có service method để lấy reviews mới nhất
        // Page<ReviewResponse> recentReviews = reviewService.getRecentReviews(pageable);

        return ResponseEntity.ok(
                APIResponse.<Page<ReviewResponse>>builder()
                        .success(true)
                        .message("Recent reviews endpoint - Implementation pending")
                        .data(null)
                        .status(HttpStatus.OK)
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }
}