package com.tripCraft.model;

import org.springframework.data.mongodb.core.mapping.Field;

public class Lunch extends Activity {
    // Any Lunch-specific properties can be added here, for example, type of cuisine, special offers, etc.
    private String lunchSpecificField; // Example of an additional field that is specific to Lunch

    // Getters and Setters for Lunch-specific fields
    public String getLunchSpecificField() {
        return lunchSpecificField;
    }
    public void setLunchSpecificField(String lunchSpecificField) {
        this.lunchSpecificField = lunchSpecificField;
    }
}
