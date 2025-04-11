package com.tripCraft.model;

import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonProperty;

public class Activity {
    private int day;
    private LocalDate date;
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
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	public String getLocation() {
		return location;
	}
	public void setLocation(String location) {
		this.location = location;
	}
	public String getImage() {
		return image;
	}
	public void setImage(String image) {
		this.image = image;
	}
	public String getTimeSlot() {
		return timeSlot;
	}
	public void setTimeSlot(String timeSlot) {
		this.timeSlot = timeSlot;
	}
	public double getEstimatedCost() {
		return estimatedCost;
	}
	public void setEstimatedCost(double estimatedCost) {
		this.estimatedCost = estimatedCost;
	}
	private String name;
    private String location;
    private String image;
    @JsonProperty("time_slot")
    private String timeSlot;
    @JsonProperty("estimated_cost")
    private double estimatedCost;
}
