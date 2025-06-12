package com.tripCraft.model;

import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "itineraries")
public class Itinerary {
    @Id
    private String id;
    private String tripId;

    private List<DailyPlan> itinerary;  // <- New field to hold days

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getTripId() {
        return tripId;
    }

    public void setTripId(String tripId) {
        this.tripId = tripId;
    }

    public List<DailyPlan> getItinerary() {
        return itinerary;
    }

    public void setItinerary(List<DailyPlan> itinerary) {
        this.itinerary = itinerary;
    }
}
