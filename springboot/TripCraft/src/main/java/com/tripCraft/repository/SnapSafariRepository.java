package com.tripCraft.repository;


import com.tripCraft.model.SnapSafari;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

public interface SnapSafariRepository extends MongoRepository<SnapSafari, String> {
    List<SnapSafari> findByUserId(String userId);

}
