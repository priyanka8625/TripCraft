package com.tripCraft.model;

public class Collaborator {
    private String userId; // Optional, assigned if the user already has an account
    private String email;

    // Getters and Setters
    public String getUserId() {
        return userId;
    }
    public Collaborator() {
		super();
		// TODO Auto-generated constructor stub
	}
	public Collaborator( String email) {
		super();
	
		this.email = email;
	}
	public void setUserId(String userId) {
        this.userId = userId;
    }
    public String getEmail() {
        return email;
    }
    public void setEmail(String email) {
        this.email = email;
    }
}
