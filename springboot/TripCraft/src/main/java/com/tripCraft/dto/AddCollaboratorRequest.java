package com.tripCraft.dto;
public class AddCollaboratorRequest {
    private String tripId;
    private String email;

    // Constructors
    public AddCollaboratorRequest() {}
    public AddCollaboratorRequest(String tripId, String email) {
        this.tripId = tripId;
        this.email = email;
    }

    // Getters and Setters
    public String getTripId() { return tripId; }
    public void setTripId(String tripId) { this.tripId = tripId; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
}
