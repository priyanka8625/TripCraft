package com.tripCraft.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.tripCraft.model.Itinerary;

public interface ItineraryRepository extends MongoRepository<Itinerary, String>{
	List<Itinerary> findByTripId(String tripId);

	 List<Itinerary> findByTripIdIn(List<String> tripIds);
}
