package com.tripCraft.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Document(collection = "destination")
public class Destination {

    @Id
    private String id;

    public String getId() {
		return id;
	}


	public void setId(String id) {
		this.id = id;
	}


	public String getDestination() {
		return destination;
	}


	public void setDestination(String destination) {
		this.destination = destination;
	}


	public List<Spot> getSpots() {
		return spots;
	}


	public void setSpots(List<Spot> spots) {
		this.spots = spots;
	}


	private String destination;
    private List<Spot> spots;


    public static class Spot {
        private String name;
        private String location;
        private String category;
        private double rating;
        private int estimatedCost;
        private String timeSlot; // NEW FIELD: morning, evening, etc.
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
		public String getCategory() {
			return category;
		}
		public void setCategory(String category) {
			this.category = category;
		}
		public double getRating() {
			return rating;
		}
		public void setRating(double rating) {
			this.rating = rating;
		}

		public int getEstimatedCost() {
			return estimatedCost;
		}
		public void setEstimatedCost(int estimatedCost) {
			this.estimatedCost = estimatedCost;
		}
		public String getTimeSlot() {
			return timeSlot;
		}
		public void setTimeSlot(String timeSlot) {
			this.timeSlot = timeSlot;
		}

        
    }
}
