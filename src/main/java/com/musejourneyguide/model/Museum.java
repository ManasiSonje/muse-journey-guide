package com.musejourneyguide.model;

import java.util.List;
import java.util.Map;

public record Museum(
        String id,
        String name,
        String city,
        String state,
        String type,
        String description,
        String address,
        String timings,
        String entryFee,
        Double latitude,
        Double longitude,
        String bookingLink,
        String imageUrl,
        String established,
        List<Review> reviews,
        Map<String, String> detailedTimings,
        Pricing pricing
) {
}
