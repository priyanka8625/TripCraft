package com.tripCraft.repository;

import com.tripCraft.model.Review;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ReviewRepository extends MongoRepository<Review, String> {
    List<Review> findByItineraryId(String itineraryId);
}

