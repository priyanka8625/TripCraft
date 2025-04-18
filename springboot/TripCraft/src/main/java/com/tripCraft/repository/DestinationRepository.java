package com.tripCraft.repository;


import org.springframework.data.mongodb.repository.MongoRepository;

import com.tripCraft.model.Destination;

public interface DestinationRepository extends MongoRepository<Destination, String> {
    Destination findByDestination(String destination);
    boolean existsByDestination(String destination);
}
