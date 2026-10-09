package com.musejourneyguide.controller;

import com.musejourneyguide.model.Museum;
import com.musejourneyguide.model.ChatRequest;
import com.musejourneyguide.model.ChatResponse;
import com.musejourneyguide.service.MuseumChatbotService;
import com.musejourneyguide.service.MuseumService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class MuseumController {

    private final MuseumService museumService;
    private final MuseumChatbotService museumChatbotService;

    public MuseumController(MuseumService museumService, MuseumChatbotService museumChatbotService) {
        this.museumService = museumService;
        this.museumChatbotService = museumChatbotService;
    }

    @PostMapping("/chat")
    public ResponseEntity<ChatResponse> chat(@RequestBody(required = false) ChatRequest request) {
        if (request == null || request.message() == null || request.message().isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(museumChatbotService.answer(request.message(), request.contextMuseumId()));
    }

    @GetMapping("/museums")
    public List<Museum> getMuseums(
            @RequestParam(required = false) String query,
            @RequestParam(required = false, defaultValue = "all") String city,
            @RequestParam(required = false, defaultValue = "all") String type
    ) {
        return museumService.search(query, city, type);
    }

    @GetMapping("/museums/search")
    public List<Museum> searchMuseums(
            @RequestParam(required = false) String query,
            @RequestParam(required = false, defaultValue = "all") String city,
            @RequestParam(required = false, defaultValue = "all") String type
    ) {
        return museumService.search(query, city, type);
    }

    @GetMapping("/museums/{id}")
    public ResponseEntity<Museum> getMuseumById(@PathVariable String id) {
        return museumService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/trip-plan")
    public List<Museum> buildTripPlan(
            @RequestParam String city,
            @RequestParam String date,
            @RequestParam(defaultValue = "4") int hours
    ) {
        LocalDate visitDate = LocalDate.parse(date);
        return museumService.planTrip(city, visitDate, hours);
    }

    @PostMapping("/museums/{id}/visit")
    public Map<String, Object> trackVisit(@PathVariable String id) {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "recorded");
        response.put("museumId", id);
        response.put("message", "Museum visit tracked successfully.");
        return response;
    }
}
