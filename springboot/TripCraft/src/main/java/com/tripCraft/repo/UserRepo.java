package com.tripCraft.repo;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import com.tripCraft.model.Users;

@Repository
public interface UserRepo extends MongoRepository<Users, String> {
    Users findByUsername(String username);
}
