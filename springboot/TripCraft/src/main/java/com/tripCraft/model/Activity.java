package com.tripCraft.model;

import java.time.LocalDate;

public class Activity {
	 private String category;
	    private String name;
	    private String location;
	    private double estimatedCost;
	    private int day;
		public void setDuration(String duration) {
			this.duration = duration;
		}
		public void setDate(String date) {
			this.date = date;
		}
		private String time_slot;
	    public String getCategory() {
			return category;
		}
		public void setCategory(String category) {
			this.category = category;
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
		public double getEstimatedCost() {
			return estimatedCost;
		}
		public void setEstimatedCost(double estimatedCost) {
			this.estimatedCost = estimatedCost;
		}
		public int getDay() {
			return day;
		}
		public void setDay(int day) {
			this.day = day;
		}
		public String getTime_slot() {
			return time_slot;
		}
		public void setTime_slot(String time_slot) {
			this.time_slot = time_slot;
		}
		public double getRating() {
			return rating;
		}
		public void setRating(double rating) {
			this.rating = rating;
		}
		public String getLatitude() {
			return latitude;
		}
		public void setLatitude(String latitude) {
			this.latitude = latitude;
		}
		public String getLongitude() {
			return longitude;
		}
		public void setLongitude(String longitude) {
			this.longitude = longitude;
		}
		public String getDurationUnit() {
			return durationUnit;
		}
		public void setDurationUnit(String durationUnit) {
			this.durationUnit = durationUnit;
		}
		public int getCluster_id() {
			return cluster_id;
		}
		public void setCluster_id(int cluster_id) {
			this.cluster_id = cluster_id;
		}
		public int getIndex() {
			return index;
		}
		public void setIndex(int index) {
			this.index = index;
		}
		public String getDuration() {
			return duration;
		}
		public String getDate() {
			return date;
		}
		private double rating;
	    private String latitude;
	    private String longitude;
	    private String duration;
	    private String durationUnit;
	    private int cluster_id;
	    private int index;
	    private String date;
   
}
