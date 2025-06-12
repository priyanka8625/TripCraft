package com.tripCraft.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Document(collection = "destination")
public class Destination {

    @Id
    private String id;
    private String destination;
    private List<Spot> spots;

    private List<Hotel> hotels;
    public List<Hotel> getHotels() {
		return hotels;
	}
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
	public void setHotels(List<Hotel> hotels) {
		this.hotels = hotels;
	}
	public static class Spot {
        private String name;
        private String location;
        private String category;
        private double rating;
        private int estimatedCost;
        private String timeSlot; // NEW FIELD: morning, evening, etc.
        private double longitude;
        private double latitude;
		public double getLongitude() {
			return longitude;
		}
		public void setLongitude(double longitude) {
			this.longitude = longitude;
		}
		public double getLatitude() {
			return latitude;
		}
		public void setLatitude(double latitude) {
			this.latitude = latitude;
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
  public static  class Hotel {
        private String name;
        private String location;
        private String category;
        private double rating;
        private double pricePerNight;
        private String stayType; // "Lunch", "Dinner", "Stay", etc.
        private double longitude;
        private double latitude;
        private String nearbySpot;
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
    	public double getPricePerNight() {
    		return pricePerNight;
    	}
    	public void setPricePerNight(double pricePerNight) {
    		this.pricePerNight = pricePerNight;
    	}
    	public String getStayType() {
    		return stayType;
    	}
    	public void setStayType(String stayType) {
    		this.stayType = stayType;
    	}
    	public double getLongitude() {
    		return longitude;
    	}
    	public void setLongitude(double longitude) {
    		this.longitude = longitude;
    	}
    	public double getLatitude() {
    		return latitude;
    	}
    	public void setLatitude(double latitude) {
    		this.latitude = latitude;
    	}
    	public String getNearbySpot() {
    		return nearbySpot;
    	}
    	public void setNearbySpot(String nearbySpot) {
    		this.nearbySpot = nearbySpot;
    	}
    	@Override
    	public String toString() {
    		return "Hotel [name=" + name + ", location=" + location + ", category=" + category + ", rating=" + rating
    				+ ", pricePerNight=" + pricePerNight + ", stayType=" + stayType + ", longitude=" + longitude
    				+ ", latitude=" + latitude + ", nearbySpot=" + nearbySpot + "]";
    	}

    }

}
