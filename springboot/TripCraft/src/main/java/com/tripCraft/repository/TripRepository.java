package com.tripCraft.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.tripCraft.model.Trip;

public interface TripRepository extends MongoRepository<Trip, String>{

	List<Trip> findByUserIdAndEndDateBefore(String userId, LocalDate date);
	List<Trip> findByUserIdAndStartDateAfter(String userId, LocalDate date);

}
