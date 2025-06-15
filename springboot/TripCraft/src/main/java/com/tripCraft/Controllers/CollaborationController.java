package com.tripCraft.Controllers;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tripCraft.Services.EmailSenderService;
import com.tripCraft.dto.AddCollaboratorRequest;
import com.tripCraft.dto.EditPayload;
import com.tripCraft.model.Activity;
import com.tripCraft.model.Collaborator;
import com.tripCraft.model.DailyPlan;
import com.tripCraft.model.Itinerary;
import com.tripCraft.model.Lunch;
import com.tripCraft.model.Stay;
import com.tripCraft.model.Trip;
import com.tripCraft.model.User;
import com.tripCraft.repository.ItineraryRepository;
import com.tripCraft.repository.TripRepository;
import com.tripCraft.repository.UserRepo;

@Controller("/api")
public class CollaborationController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private ItineraryRepository itineraryRepository;

    @Autowired
    private TripRepository tripRepository;

    @Autowired
    private UserRepo userRepository;

    @Autowired
    private EmailSenderService emailSenderService;

    @PostMapping("/add-collaborator")
    public ResponseEntity<String> addCollaborator(@RequestBody AddCollaboratorRequest request) {
        Optional<Trip> optionalTrip = tripRepository.findById(request.getTripId());
        if (optionalTrip.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Trip not found");
        }

        Trip trip = optionalTrip.get();

        // Avoid duplicate collaborators
        boolean alreadyAdded = trip.getCollaborators().stream()
            .anyMatch(c -> c.getEmail().equalsIgnoreCase(request.getEmail()));

        if (alreadyAdded) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Collaborator already exists");
        }

        // Create and link collaborator
        Collaborator collaborator = new Collaborator();
        collaborator.setEmail(request.getEmail());

        Optional<User> userCollab = userRepository.findByEmail(request.getEmail());
        userCollab.ifPresent(value -> collaborator.setUserId(value.getId()));

        trip.getCollaborators().add(collaborator);
        tripRepository.save(trip);

        // Send email invite
        String subject = "New Trip Added!";
        String body = "Hi there!\n\n"
                + "You've been added as a collaborator to an exciting new trip on TripCraft!\n\n"
                + "📍 Destination: " + trip.getDestination() + "\n"
                + "📅 Dates: " + trip.getStartDate() + " to " + trip.getEndDate() + "\n\n"
                + "Click the link below to view and contribute to this trip:\n"
                + "👉 http://localhost:3000/trip/" + trip.getId() + " \n\n"
                + "Happy Planning!\n"
                + "- Team TripCraft";

        emailSenderService.sendEmail(request.getEmail(), subject, body);

        return ResponseEntity.ok("Collaborator added and email sent");
    }
    
    @MessageMapping("/trip/{tripId}/edit")
    public void editItinerary(@DestinationVariable String tripId, @Payload EditPayload payload) {
        Itinerary itinerary = itineraryRepository.findByTripId(tripId);

        for (DailyPlan dayPlan : itinerary.getItinerary()) {
            if (dayPlan.getDay() == payload.getDay()) {
                switch (payload.getSection()) {
                    case "activity":
                        Activity activity = convert(payload.getPayload(), Activity.class);
                        handleActivity(dayPlan, activity, payload.getActionType());
                        break;
                    case "lunch":
                        Lunch lunch = convert(payload.getPayload(), Lunch.class);
                        handleLunch(dayPlan, lunch, payload.getActionType());
                        break;
                    case "stay":
                        Stay stay = convert(payload.getPayload(), Stay.class);
                        handleStay(dayPlan, stay, payload.getActionType());
                        break;
                }
            }
        }

        itineraryRepository.save(itinerary);

        messagingTemplate.convertAndSend("/topic/trip/" + tripId, payload);
    }

    private <T> T convert(Object obj, Class<T> clazz) {
        ObjectMapper mapper = new ObjectMapper();
        return mapper.convertValue(obj, clazz);
    }

    private void handleActivity(DailyPlan dayPlan, Activity activity, String type) {
        if (type.equals("add")) dayPlan.getActivities().add(activity);
        if (type.equals("remove")) dayPlan.getActivities().removeIf(a -> a.getName().equals(activity.getName()));
    }

    private void handleLunch(DailyPlan dayPlan, Lunch lunch, String type) {
        if (type.equals("add")) dayPlan.getLunch().add(lunch);
        if (type.equals("remove")) dayPlan.getLunch().removeIf(l -> l.getName().equals(lunch.getName()));
    }

    private void handleStay(DailyPlan dayPlan, Stay stay, String type) {
        if (type.equals("add")) dayPlan.getStay().add(stay);
        if (type.equals("remove")) dayPlan.getStay().removeIf(s -> s.getName().equals(stay.getName()));
    }
}