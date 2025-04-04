package com.tripCraft.model;


import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Document(collection = "posts")
public class Post {
    
	@Id
    private String id;
    private String caption;
    private String imageUrl;  // Store Cloudinary URL
    private int likes;
    private String userId;

    public String getUserId() {
		return userId;
	}
	public void setUserId(String userId) {
		this.userId = userId;
	}
	private List<String> likedByUsers;

    // Getters and Setters
    public String getId() {
		return id;
	}
	public void setId(String id) {
		this.id = id;
	}
	public String getCaption() {
		return caption;
	}
	public void setCaption(String caption) {
		this.caption = caption;
	}
	public String getImageUrl() {
		return imageUrl;
	}
	public void setImageUrl(String imageUrl) {
		this.imageUrl = imageUrl;
	}
	public int getLikes() {
		return likes;
	}
	public void setLikes(int likes) {
		this.likes = likes;
	}
	public List<String> getLikedByUsers() {
		return likedByUsers;
	}
	public void setLikedByUsers(List<String> likedByUsers) {
		this.likedByUsers = likedByUsers;
	}
}
