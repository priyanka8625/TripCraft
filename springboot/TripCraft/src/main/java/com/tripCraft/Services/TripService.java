package com.tripCraft.Services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.tripCraft.model.Trip;
import com.tripCraft.repository.TripRepository;

@Service
public class TripService {

	@Autowired
    private  TripRepository tripRepository;
	
	public List<Trip> getTripsForLoggedInUser(String userId) {
	    return tripRepository.findTripsSharedWithUser(userId);
	}

}
