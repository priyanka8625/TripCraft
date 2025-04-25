package com.tripCraft.model;

import java.util.List;

public class PlanResponse {
    private List<DailyPlanResponse> days;
    // Getters and Setters
    private Trip trip;
	public Trip getTrip() {
		return trip;
	}

	public void setTrip(Trip trip) {
		this.trip = trip;
	}

	public List<DailyPlanResponse> getDays() {
		return days;
	}

	public void setDays(List<DailyPlanResponse> days) {
		this.days = days;
	}
}
