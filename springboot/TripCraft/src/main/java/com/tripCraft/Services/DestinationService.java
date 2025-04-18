package com.tripCraft.Services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.tripCraft.model.Destination;
import com.tripCraft.repository.DestinationRepository;

@Service
public class DestinationService {

    @Autowired
    private DestinationRepository destinationRepository;

    public void addTimeSlotToSpots(String destinationName, String timeSlot) {
        Destination destination = destinationRepository.findByDestination(destinationName);
        if (destination != null && destination.getSpots() != null) {
            for (Destination.Spot spot : destination.getSpots()) {
                spot.setTimeSlot(timeSlot);
            }
            destinationRepository.save(destination);
        }
    }
}
