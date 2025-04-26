package com.tripCraft.model;

import java.util.List;
import java.util.Map;

public class PythonItinerary {
    private String destination;
    private List<String> days;
    private Map<String, List<String>> itinerary;

    public String getDestination() {
        return destination;
    }

    public void setDestination(String destination) {
        this.destination = destination;
    }

    public List<String> getDays() {
        return days;
    }

    public void setDays(List<String> days) {
        this.days = days;
    }

    public Map<String, List<String>> getItinerary() {
        return itinerary;
    }

    public void setItinerary(Map<String, List<String>> itinerary) {
        this.itinerary = itinerary;
    }
}
