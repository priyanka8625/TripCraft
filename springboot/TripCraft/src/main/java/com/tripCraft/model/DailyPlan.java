package com.tripCraft.model;

import java.time.LocalDate;
import java.util.List;

public class DailyPlan {
    private int day;
    private LocalDate date;
    private List<Activity> activities;
    private List<Lunch> lunch;
    private List<Stay> stay;

    // Getters and setters
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

    public List<Activity> getActivities() {
        return activities;
    }

    public void setActivities(List<Activity> activities) {
        this.activities = activities;
    }

    public List<Lunch> getLunch() {
        return lunch;
    }

    public void setLunch(List<Lunch> lunch) {
        this.lunch = lunch;
    }

    public List<Stay> getStay() {
        return stay;
    }

    public void setStay(List<Stay> stay) {
        this.stay = stay;
    }
}
