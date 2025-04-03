package com.tripCraft.Controllers;

public record ItineraryRequest(
	    String destination,
	    int people,
	    int days,
	    String startDate,
	    String endDate,
	    double budget,
	    String interest  // New attribute added
	) {}

