package com.tripCraft.model;

import java.util.List;
public class DailyPlanResponse {
    private int day; // Day of the trip
    private List<Activity> activities; // List of activities for the day
    private List<Lunch> lunches; // List of 2 lunches
    private Stay stay; // 1 stay for the day

    // Getters and Setters
    public int getDay() {
        return day;
    }

    public void setDay(int day) {
        this.day = day;
    }

    public List<Activity> getActivities() {
        return activities;
    }

    public void setActivities(List<Activity> activities) {
        this.activities = activities;
    }

    public List<Lunch> getLunches() {
        return lunches;
    }

    public void setLunches(List<Lunch> lunches) {
        this.lunches = lunches;
    }

    public Stay getStay() {
        return stay;
    }

    public void setStay(Stay stay) {
        this.stay = stay;
    }
}
