package com.tripCraft.model;

public class TripResponse {
    private Trip trip;
    private PythonItinerary itinerary;

    public Trip getTrip() {
        return trip;
    }

    public void setTrip(Trip trip) {
        this.trip = trip;
    }

    public PythonItinerary getItinerary() {
        return itinerary;
    }

    public void setItinerary(PythonItinerary itinerary) {
        this.itinerary = itinerary;
    }
}
