package com.tripCraft.model;

import org.springframework.data.mongodb.core.mapping.Field;

public class Lunch {
    
    @Field("latitude")
    private double latitude;

    @Field("longitude")
    private double longitude;

    @Field("location")
    private String location;

    @Field("name")
    private String name;

    @Field("price")
    private double price;

    @Field("rating")
    private double rating;

    // Getters and Setters

    public double getLatitude() {
        return latitude;
    }

    public void setLatitude(double latitude) {
        this.latitude = latitude;
    }

    public double getLongitude() {
        return longitude;
    }

    public void setLongitude(double longitude) {
        this.longitude = longitude;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public double getPrice() {
        return price;
    }

    public void setPrice(double price) {
        this.price = price;
    }

    public double getRating() {
        return rating;
    }

    public void setRating(double rating) {
        this.rating = rating;
    }
}
