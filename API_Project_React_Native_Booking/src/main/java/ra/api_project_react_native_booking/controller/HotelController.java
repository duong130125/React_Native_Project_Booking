package ra.api_project_react_native_booking.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ra.api_project_react_native_booking.dto.response.APIResponse;
import ra.api_project_react_native_booking.dto.response.HotelResponse;
import ra.api_project_react_native_booking.service.interfaces.HotelService;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/v1/hotels")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class HotelController {

    private final HotelService hotelService;

    @GetMapping("/best")
    public ResponseEntity<APIResponse<List<HotelResponse>>> getBestHotels() {
        List<HotelResponse> hotels = hotelService.getTop5BestHotels();

        return ResponseEntity.ok(
                APIResponse.<List<HotelResponse>>builder()
                        .success(true)
                        .message("Best hotels retrieved successfully")
                        .data(hotels)
                        .status(HttpStatus.OK)
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<APIResponse<HotelResponse>> getHotelById(@PathVariable Long id) {
        HotelResponse hotel = hotelService.getHotelById(id);

        return ResponseEntity.ok(
                APIResponse.<HotelResponse>builder()
                        .success(true)
                        .message("Hotel details retrieved successfully")
                        .data(hotel)
                        .status(HttpStatus.OK)
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }

    @GetMapping("/search")
    public ResponseEntity<APIResponse<List<HotelResponse>>> searchHotels(@RequestParam String keyword) {
        List<HotelResponse> hotels = hotelService.searchHotels(keyword);

        return ResponseEntity.ok(
                APIResponse.<List<HotelResponse>>builder()
                        .success(true)
                        .message("Hotels searched successfully")
                        .data(hotels)
                        .status(HttpStatus.OK)
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }

    @GetMapping("/city/{city}")
    public ResponseEntity<APIResponse<List<HotelResponse>>> getHotelsByCity(@PathVariable String city) {
        List<HotelResponse> hotels = hotelService.getHotelsByCity(city);

        return ResponseEntity.ok(
                APIResponse.<List<HotelResponse>>builder()
                        .success(true)
                        .message("Hotels in " + city + " retrieved successfully")
                        .data(hotels)
                        .status(HttpStatus.OK)
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }

    @GetMapping
    public ResponseEntity<APIResponse<List<HotelResponse>>> getAllHotels() {
        List<HotelResponse> hotels = hotelService.getAllHotels();

        return ResponseEntity.ok(
                APIResponse.<List<HotelResponse>>builder()
                        .success(true)
                        .message("All hotels retrieved successfully")
                        .data(hotels)
                        .status(HttpStatus.OK)
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }

    @GetMapping("/featured")
    public ResponseEntity<APIResponse<List<HotelResponse>>> getFeaturedHotels() {
        List<HotelResponse> featuredHotels = hotelService.getTop5BestHotels();

        return ResponseEntity.ok(
                APIResponse.<List<HotelResponse>>builder()
                        .success(true)
                        .message("Featured hotels retrieved successfully")
                        .data(featuredHotels)
                        .status(HttpStatus.OK)
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }

    @GetMapping("/top-rated")
    public ResponseEntity<APIResponse<List<HotelResponse>>> getTopRatedHotels() {
        List<HotelResponse> topRatedHotels = hotelService.getTop5BestHotels();

        return ResponseEntity.ok(
                APIResponse.<List<HotelResponse>>builder()
                        .success(true)
                        .message("Top rated hotels retrieved successfully")
                        .data(topRatedHotels)
                        .status(HttpStatus.OK)
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }

    @GetMapping("/filter")
    public ResponseEntity<APIResponse<List<HotelResponse>>> filterHotelsByRating(
            @RequestParam(required = false) Integer minRating,
            @RequestParam(required = false) Integer maxRating,
            @RequestParam(required = false) String city) {

        List<HotelResponse> filteredHotels = hotelService.getAllHotels()
                .stream()
                .filter(hotel ->
                        (minRating == null || hotel.getStarRating() >= minRating) &&
                                (maxRating == null || hotel.getStarRating() <= maxRating) &&
                                (city == null || hotel.getCity().toLowerCase().contains(city.toLowerCase()))
                )
                .toList();

        return ResponseEntity.ok(
                APIResponse.<List<HotelResponse>>builder()
                        .success(true)
                        .message("Hotels filtered successfully")
                        .data(filteredHotels)
                        .status(HttpStatus.OK)
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }
}