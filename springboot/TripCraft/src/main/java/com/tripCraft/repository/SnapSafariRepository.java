package com.tripCraft.repository;


import com.tripCraft.model.SnapSafari;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface SnapSafariRepository extends MongoRepository<SnapSafari, String> {
}
