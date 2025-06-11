package com.tripCraft.model;

import org.springframework.data.mongodb.core.mapping.Field;

public class Stay extends Activity {
    private String hotelName;
    private double costPerNight;

    // Optional fields such as rating, amenities, etc.
    @Field("stay_rating")
    private double rating;

    // Getters and Setters
    public String getHotelName() {
        return hotelName;
    }
    public void setHotelName(String hotelName) {
        this.hotelName = hotelName;
    }
    public double getCostPerNight() {
        return costPerNight;
    }
    public void setCostPerNight(double costPerNight) {
        this.costPerNight = costPerNight;
    }
    public double getRating() {
        return rating;
    }
    public void setRating(double rating) {
        this.rating = rating;
    }
}
