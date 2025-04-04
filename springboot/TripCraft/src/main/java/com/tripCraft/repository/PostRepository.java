package com.tripCraft.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.tripCraft.model.Post;

public interface PostRepository extends MongoRepository<Post, String>{
	List<Post> findByUserId(String userId);

}
