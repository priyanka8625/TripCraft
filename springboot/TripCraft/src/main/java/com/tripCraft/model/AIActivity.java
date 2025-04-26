package com.tripCraft.model;

import java.time.LocalDate;

public class AIActivity {
    private int activityId;
    private String category;
    private int clusterId;
    private LocalDate date;
    private int day;
    private double distance;
    private String distanceUnit;
    private double duration;
    private String durationUnit;
    private double estimatedCost;
    private int index;
    private double latitude;
    private String location;
    private double longitude;
    private int matrixIndex;
    private String name;
    private double rating;
    private String timeSlot;

    // Getters and Setters
    public int getActivityId() {
        return activityId;
    }
    public void setActivityId(int activityId) {
        this.activityId = activityId;
    }

    public String getCategory() {
        return category;
    }
    public void setCategory(String category) {
        this.category = category;
    }

    public int getClusterId() {
        return clusterId;
    }
    public void setClusterId(int clusterId) {
        this.clusterId = clusterId;
    }

    public LocalDate getDate() {
        return date;
    }
    public void setDate(LocalDate date) {
        this.date = date;
    }

    public int getDay() {
        return day;
    }
    public void setDay(int day) {
        this.day = day;
    }

    public double getDistance() {
        return distance;
    }
    public void setDistance(double distance) {
        this.distance = distance;
    }

    public String getDistanceUnit() {
        return distanceUnit;
    }
    public void setDistanceUnit(String distanceUnit) {
        this.distanceUnit = distanceUnit;
    }

    public double getDuration() {
        return duration;
    }
    public void setDuration(double duration) {
        this.duration = duration;
    }

    public String getDurationUnit() {
        return durationUnit;
    }
    public void setDurationUnit(String durationUnit) {
        this.durationUnit = durationUnit;
    }

    public double getEstimatedCost() {
        return estimatedCost;
    }
    public void setEstimatedCost(double estimatedCost) {
        this.estimatedCost = estimatedCost;
    }

    public int getIndex() {
        return index;
    }
    public void setIndex(int index) {
        this.index = index;
    }

    public double getLatitude() {
        return latitude;
    }
    public void setLatitude(double latitude) {
        this.latitude = latitude;
    }

    public String getLocation() {
        return location;
    }
    public void setLocation(String location) {
        this.location = location;
    }

    public double getLongitude() {
        return longitude;
    }
    public void setLongitude(double longitude) {
        this.longitude = longitude;
    }

    public int getMatrixIndex() {
        return matrixIndex;
    }
    public void setMatrixIndex(int matrixIndex) {
        this.matrixIndex = matrixIndex;
    }

    public String getName() {
        return name;
    }
    public void setName(String name) {
        this.name = name;
    }

    public double getRating() {
        return rating;
    }
    public void setRating(double rating) {
        this.rating = rating;
    }

    public String getTimeSlot() {
        return timeSlot;
    }
    public void setTimeSlot(String timeSlot) {
        this.timeSlot = timeSlot;
    }
}
