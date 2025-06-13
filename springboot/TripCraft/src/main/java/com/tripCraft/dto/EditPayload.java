package com.tripCraft.dto;

public class EditPayload {
    private String tripId;
    private String userEmail;
    private String actionType; // add/edit/remove
    private String section; // activity/lunch/stay
    private int day;
    private Object payload; // can hold Activity/Lunch/Stay (deserialized manually)
    // Getters/Setters
	
	@Override
	public String toString() {
		return "EditPayload [tripId=" + tripId + ", userEmail=" + userEmail + ", actionType=" + actionType
				+ ", section=" + section + ", day=" + day + ", payload=" + payload + "]";
	}
	public EditPayload() {
		super();
		// TODO Auto-generated constructor stub
	}
	public EditPayload(String tripId, String userEmail, String actionType, String section, int day, Object payload) {
		super();
		this.tripId = tripId;
		this.userEmail = userEmail;
		this.actionType = actionType;
		this.section = section;
		this.day = day;
		this.payload = payload;
	}
	public String getTripId() {
		return tripId;
	}
	public void setTripId(String tripId) {
		this.tripId = tripId;
	}
	public String getUserEmail() {
		return userEmail;
	}
	public void setUserEmail(String userEmail) {
		this.userEmail = userEmail;
	}
	public String getActionType() {
		return actionType;
	}
	public void setActionType(String actionType) {
		this.actionType = actionType;
	}
	public String getSection() {
		return section;
	}
	public void setSection(String section) {
		this.section = section;
	}
	public int getDay() {
		return day;
	}
	public void setDay(int day) {
		this.day = day;
	}
	public Object getPayload() {
		return payload;
	}
	public void setPayload(Object payload) {
		this.payload = payload;
	}
}