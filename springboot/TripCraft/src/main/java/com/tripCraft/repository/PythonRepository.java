package com.tripCraft.repository;


import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.tripCraft.model.Itinerary;
import com.tripCraft.model.PythonItinerary;

public interface PythonRepository extends MongoRepository<PythonItinerary, String>{
	List<PythonItinerary> findByTripId(String tripId);

	 List<PythonItinerary> findByTripIdIn(List<String> tripIds);
}
