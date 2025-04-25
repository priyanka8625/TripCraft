package com.tripCraft.model;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "trips")
public class Trip {
    @Id
    private String id;
    private String userId;
    private String title;
    private String destination;
    private LocalDate startDate;
    private LocalDate endDate;
    private double budget;
    private boolean isAiGenerated;
    private String status; // Planned, Ongoing, Completed
    private List<Collaborator> collaborators;
    private List<String> preferences; // New preference array attribute
    private LocalDateTime createdAt = LocalDateTime.now();
    private int people;
    private String thumbnail;

    public String getThumbnail() {
        return thumbnail;
    }

    public void setThumbnail(String thumbnail) {
        this.thumbnail = thumbnail;
    }

    public int getPeople() {
		return people;
	}
	public void setPeople(int people) {
		this.people = people;
	}
	public void setPreferences(List<String> preferences) {
		this.preferences = preferences;
	}
	// Getters and setters
    public String getId() {
        return id;
    }
    public void setId(String id) {
        this.id = id;
    }
    public String getUserId() {
        return userId;
    }
    public void setUserId(String userId) {
        this.userId = userId;
    }
    public String getTitle() {
        return title;
    }
    public void setTitle(String title) {
        this.title = title;
    }
    public String getDestination() {
        return destination;
    }
    public void setDestination(String destination) {
        this.destination = destination;
    }
    public LocalDate getStartDate() {
        return startDate;
    }
    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }
    public LocalDate getEndDate() {
        return endDate;
    }
    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }
    public double getBudget() {
        return budget;
    }
    public void setBudget(double budget) {
        this.budget = budget;
    }
    public boolean isAiGenerated() {
        return isAiGenerated;
    }
    public void setAiGenerated(boolean isAiGenerated) {
        this.isAiGenerated = isAiGenerated;
    }
    public String getStatus() {
        return status;
    }
    public void setStatus(String status) {
        this.status = status;
    }
    public List<Collaborator> getCollaborators() {
        return collaborators;
    }
    public void setCollaborators(List<Collaborator> collaborators) {
        this.collaborators = collaborators;
    }
    public List<String> getPreferences() {
        return preferences;
    }
    public void setPreference(List<String> preferences) {
        this.preferences = preferences;
    }
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
