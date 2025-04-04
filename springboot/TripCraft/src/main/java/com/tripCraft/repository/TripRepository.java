package com.tripCraft.repository;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.tripCraft.model.Trip;

public interface TripRepository extends MongoRepository<Trip, String>{

}
