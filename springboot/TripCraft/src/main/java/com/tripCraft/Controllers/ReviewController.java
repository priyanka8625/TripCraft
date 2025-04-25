package com.tripCraft.Controllers;


import com.tripCraft.model.Review;
import com.tripCraft.repository.ReviewRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    private final ReviewRepository reviewRepository;

    public ReviewController(ReviewRepository reviewRepository) {
        this.reviewRepository = reviewRepository;
    }

    // ✅ Get all reviews
    @GetMapping
    public List<Review> getAllReviews() {
        return reviewRepository.findAll();
    }

    // ✅ Get a single review by ID
    @GetMapping("/{id}")
    public ResponseEntity<Review> getReviewById(@PathVariable String id) {
    	
        Optional<Review> review = reviewRepository.findById(id);
        return review.map(ResponseEntity::ok)
                     .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // ✅ Get reviews for a specific itinerary
    @GetMapping("/itinerary/{itineraryId}")
    public List<Review> getReviewsByItineraryId(@PathVariable String itineraryId) {
        return reviewRepository.findByItineraryId(itineraryId);
    }

    // ✅ Create a new review
    @PostMapping
    public ResponseEntity<Review> createReview(@RequestBody Review review) {
        Review savedReview = reviewRepository.save(review);
        return ResponseEntity.ok(savedReview);
    }

    // ✅ Update an existing review
    @PutMapping("/{id}")
    public ResponseEntity<Review> updateReview(@PathVariable String id, @RequestBody Review updatedReview) {
        if (!reviewRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        updatedReview.setId(id);  // Ensure the correct ID is set
        Review savedReview = reviewRepository.save(updatedReview);
        return ResponseEntity.ok(savedReview);
    }

    // ✅ Delete a review
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReview(@PathVariable String id) {
        if (!reviewRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        reviewRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
