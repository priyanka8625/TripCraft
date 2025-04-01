package com.tripCraft.model;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
@Document(collection = "snap_safari")
public class SnapSafari {
    @Id
    private String id;
    private String userId;
    private String destination;
    private String title;
    private String description;
    private List<String> images;
    private int likes;
    private List<Comment> comments;
    private LocalDateTime createdAt = LocalDateTime.now();
}

class Comment {
    private String userId;
    private String comment;
}
