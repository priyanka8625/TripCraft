package com.tripCraft.model;

import java.time.LocalDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "reviews")
public class Review {
    @Id
    private String id;
    private String userId;
    private String itineraryId;
    private double rating;
    private String comment;
    private LocalDateTime createdAt = LocalDateTime.now();
}
