package com.tripCraft.Controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tripCraft.dto.EditPayload;
import com.tripCraft.model.Activity;
import com.tripCraft.model.DailyPlan;
import com.tripCraft.model.Itinerary;
import com.tripCraft.model.Lunch;
import com.tripCraft.model.Stay;
import com.tripCraft.repository.ItineraryRepository;

@Controller
public class CollaborationController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private ItineraryRepository itineraryRepository;

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