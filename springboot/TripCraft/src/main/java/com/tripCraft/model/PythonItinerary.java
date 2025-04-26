package com.tripCraft.model;

import java.util.List;

public class PythonItinerary {
    private String destination;
    private List<AIActivity> activities;
    private String tripId;
    public String getTripId() {
		return tripId;
	}

	public void setTripId(String tripId) {
		this.tripId = tripId;
	}

	public String getDestination() {
        return destination;
    }

    public void setDestination(String destination) {
        this.destination = destination;
    }

    public List<AIActivity> getActivities() {
        return activities;
    }

    public void setActivities(List<AIActivity> activities) {
        this.activities = activities;
    }
}
