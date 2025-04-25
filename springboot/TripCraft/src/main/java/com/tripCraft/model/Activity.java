package com.tripCraft.model;

import java.time.LocalDate;

public class Activity {
    private int day;
    private LocalDate date;
    private String category;
    private double rating;
    private String name;
    private String location;
    private String time_slot;
    private double estimatedCost;

    // New fields for location coordinates
    private double longitude;
    private double latitude;

    // Getters and Setters
    public int getDay() {
        return day;
    }
    public void setDay(int day) {
        this.day = day;
    }

    public LocalDate getDate() {
        return date;
    }
    public void setDate(LocalDate date) {
        this.date = date;
    }

    public String getCategory() {
        return category;
    }
    public void setCategory(String category) {
        this.category = category;
    }

    public double getRating() {
        return rating;
    }
    public void setRating(double rating) {
        this.rating = rating;
    }

    public String getName() {
        return name;
    }
    public void setName(String name) {
        this.name = name;
    }

    public String getLocation() {
        return location;
    }
    public void setLocation(String location) {
        this.location = location;
    }

    public String getTimeSlot() {
        return time_slot;
    }
    public void setTimeSlot(String timeSlot) {
        this.time_slot = timeSlot;
    }

    public double getEstimatedCost() {
        return estimatedCost;
    }
    public void setEstimatedCost(double estimatedCost) {
        this.estimatedCost = estimatedCost;
    }

    public double getLongitude() {
        return longitude;
    }
    public void setLongitude(double longitude) {
        this.longitude = longitude;
    }

    public double getLatitude() {
        return latitude;
    }
    public void setLatitude(double latitude) {
        this.latitude = latitude;
    }
}
