package com.musejourneyguide.service;

import com.musejourneyguide.model.Museum;
import com.musejourneyguide.model.Pricing;
import com.musejourneyguide.model.Review;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.TextStyle;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class MuseumService {

    private final List<Museum> museums = List.of(
            new Museum(
                    "mumbai-gateway",
                    "Gateway of India",
                    "Mumbai",
                    "Maharashtra",
                    "Historic Landmark",
                    "A prominent monument facing the Arabian Sea, known for its colonial heritage and lively waterfront promenade.",
                    "Apollo Bandar, Colaba, Mumbai",
                    "9:00 AM - 6:00 PM",
                    "Free",
                    18.921984,
                    72.834654,
                    "https://www.mumbaitourism.com/",
                    "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1200&q=80",
                    "1924",
                    List.of(new Review("Aisha", 5, "Beautiful place at sunset."), new Review("Rohan", 4, "Great heritage view.")),
                    Map.of(
                            "monday", "9:00 AM - 6:00 PM",
                            "tuesday", "9:00 AM - 6:00 PM",
                            "wednesday", "9:00 AM - 6:00 PM",
                            "thursday", "9:00 AM - 6:00 PM",
                            "friday", "9:00 AM - 6:00 PM",
                            "saturday", "9:00 AM - 6:00 PM",
                            "sunday", "10:00 AM - 4:00 PM"
                    ),
                    new Pricing("₹150", "₹75")
            ),
            new Museum(
                    "csmm",
                    "Chhatrapati Shivaji Maharaj Vastu Sangrahalaya",
                    "Mumbai",
                    "Maharashtra",
                    "Art & History",
                    "A major museum with extensive galleries collecting Indian art, sculpture, and antiquities.",
                    "Prince of Wales Museum Rd, Fort, Mumbai",
                    "10:00 AM - 6:00 PM",
                    "₹200",
                    18.9269,
                    72.8335,
                    "https://csmvs.maharashtra.gov.in/",
                    "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=1200&q=80",
                    "1922",
                    List.of(new Review("Meera", 5, "Excellent collections and calm environment.")),
                    Map.of(
                            "monday", "10:00 AM - 6:00 PM",
                            "tuesday", "10:00 AM - 6:00 PM",
                            "wednesday", "10:00 AM - 6:00 PM",
                            "thursday", "10:00 AM - 6:00 PM",
                            "friday", "10:00 AM - 6:00 PM",
                            "saturday", "10:00 AM - 6:00 PM",
                            "sunday", "Closed"
                    ),
                    new Pricing("₹200", "₹100")
            ),
            new Museum(
                    "pune-science",
                    "Pune Tribal and Folk Art Museum",
                    "Pune",
                    "Maharashtra",
                    "Culture",
                    "A vivid museum detailing tribal heritage, regional crafts, and Indigenous traditions in Maharashtra.",
                    "Shivajinagar, Pune",
                    "10:30 AM - 5:30 PM",
                    "₹50",
                    18.5318,
                    73.8470,
                    "https://www.punecitytourism.org/",
                    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
                    "2003",
                    List.of(new Review("Nina", 4, "Rich cultural stories and excellent curation.")),
                    Map.of(
                            "monday", "10:30 AM - 5:30 PM",
                            "tuesday", "10:30 AM - 5:30 PM",
                            "wednesday", "10:30 AM - 5:30 PM",
                            "thursday", "10:30 AM - 5:30 PM",
                            "friday", "10:30 AM - 5:30 PM",
                            "saturday", "11:00 AM - 5:00 PM",
                            "sunday", "Closed"
                    ),
                    new Pricing("₹50", "₹25")
            ),
            new Museum(
                    "nagpur-heritage",
                    "Nagpur Central Museum",
                    "Nagpur",
                    "Maharashtra",
                    "History",
                    "A family-friendly museum featuring regional history, culture, and archaeological exhibits.",
                    "Madhuban, Nagpur",
                    "9:30 AM - 5:30 PM",
                    "₹40",
                    21.1458,
                    79.0882,
                    "https://nagpurtourism.com/",
                    "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=80",
                    "1950",
                    List.of(new Review("Ankit", 4, "Well-kept exhibits and local heritage.")),
                    Map.of(
                            "monday", "9:30 AM - 5:30 PM",
                            "tuesday", "9:30 AM - 5:30 PM",
                            "wednesday", "9:30 AM - 5:30 PM",
                            "thursday", "9:30 AM - 5:30 PM",
                            "friday", "9:30 AM - 5:30 PM",
                            "saturday", "10:00 AM - 4:00 PM",
                            "sunday", "Closed"
                    ),
                    new Pricing("₹40", "₹20")
            ),
            new Museum(
                    "aurangabad-archaeology",
                    "Aurangabad Archaeological Museum",
                    "Aurangabad",
                    "Maharashtra",
                    "Archaeology",
                    "This museum showcases the grandeur of Deccan heritage through stone sculptures, coins, and historical objects.",
                    "Near Cidco, Aurangabad",
                    "10:00 AM - 5:00 PM",
                    "₹60",
                    19.8762,
                    75.3433,
                    "https://aurangabadlive.com/",
                    "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&w=1200&q=80",
                    "1969",
                    List.of(new Review("Suhas", 5, "Excellent curation of the Deccan region.")),
                    Map.of(
                            "monday", "10:00 AM - 5:00 PM",
                            "tuesday", "10:00 AM - 5:00 PM",
                            "wednesday", "10:00 AM - 5:00 PM",
                            "thursday", "10:00 AM - 5:00 PM",
                            "friday", "10:00 AM - 5:00 PM",
                            "saturday", "10:00 AM - 5:00 PM",
                            "sunday", "Closed"
                    ),
                    new Pricing("₹60", "₹30")
            ),
            new Museum(
                    "kolhapur-heritage",
                    "Kolhapur City Museum",
                    "Kolhapur",
                    "Maharashtra",
                    "Heritage",
                    "A compact museum highlighting the rich cultural identity, local crafts, and royal history of Kolhapur.",
                    "Shivaji University Road, Kolhapur",
                    "9:00 AM - 5:30 PM",
                    "₹45",
                    16.7050,
                    74.2433,
                    "https://www.kolhapurtourism.org/",
                    "https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&w=1200&q=80",
                    "1975",
                    List.of(new Review("Priya", 4, "Lovely local heritage museum.")),
                    Map.of(
                            "monday", "9:00 AM - 5:30 PM",
                            "tuesday", "9:00 AM - 5:30 PM",
                            "wednesday", "9:00 AM - 5:30 PM",
                            "thursday", "9:00 AM - 5:30 PM",
                            "friday", "9:00 AM - 5:30 PM",
                            "saturday", "9:00 AM - 4:30 PM",
                            "sunday", "Closed"
                    ),
                    new Pricing("₹45", "₹20")
            )
    );

    public List<Museum> findAll() {
        return museums;
    }

    public List<Museum> search(String query, String city, String type) {
        String normalizedQuery = query == null ? "" : query.trim().toLowerCase(Locale.ROOT);
        String normalizedCity = city == null || city.isBlank() || "all".equalsIgnoreCase(city) ? null : city.trim();
        String normalizedType = type == null || type.isBlank() || "all".equalsIgnoreCase(type) ? null : type.trim();

        return museums.stream()
                .filter(museum -> {
                    if (normalizedCity != null && !normalizedCity.equalsIgnoreCase(museum.city())) {
                        return false;
                    }
                    if (normalizedType != null && !normalizedType.equalsIgnoreCase(museum.type())) {
                        return false;
                    }
                    if (normalizedQuery.isBlank()) {
                        return true;
                    }
                    return museum.name().toLowerCase(Locale.ROOT).contains(normalizedQuery)
                            || museum.city().toLowerCase(Locale.ROOT).contains(normalizedQuery)
                            || museum.type().toLowerCase(Locale.ROOT).contains(normalizedQuery)
                            || museum.description().toLowerCase(Locale.ROOT).contains(normalizedQuery);
                })
                .collect(Collectors.toList());
    }

    public Optional<Museum> findById(String id) {
        return museums.stream().filter(museum -> museum.id().equalsIgnoreCase(id)).findFirst();
    }

    public List<Museum> planTrip(String city, LocalDate date, int hours) {
        String targetCity = city == null ? "" : city.trim();
        if (targetCity.isBlank()) {
            return List.of();
        }

        return museums.stream()
                .filter(museum -> museum.city().equalsIgnoreCase(targetCity))
                .filter(museum -> isOpenOnDay(museum, date))
                .sorted(Comparator.comparingDouble(museum -> distanceFromCityCenter(targetCity, museum)))
                .limit(3)
                .collect(Collectors.toList());
    }

    private boolean isOpenOnDay(Museum museum, LocalDate date) {
        Map<String, String> timings = museum.detailedTimings();
        if (timings == null || timings.isEmpty()) {
            return true;
        }

        String dayName = date.getDayOfWeek().getDisplayName(TextStyle.FULL, Locale.ENGLISH).toLowerCase(Locale.ROOT);
        String timing = timings.getOrDefault(dayName, "").toLowerCase(Locale.ROOT);
        return timing.isBlank() || !timing.contains("closed");
    }

    private double distanceFromCityCenter(String city, Museum museum) {
        Map<String, double[]> cityCenters = Map.of(
                "Mumbai", new double[]{19.0760, 72.8777},
                "Pune", new double[]{18.5204, 73.8567},
                "Nagpur", new double[]{21.1458, 79.0882},
                "Nashik", new double[]{19.9975, 73.7898},
                "Aurangabad", new double[]{19.8762, 75.3433},
                "Kolhapur", new double[]{16.7050, 74.2433}
        );

        double[] center = cityCenters.getOrDefault(city, new double[]{0.0, 0.0});
        double lat1 = center[0];
        double lon1 = center[1];
        double lat2 = museum.latitude() == null ? 0.0 : museum.latitude();
        double lon2 = museum.longitude() == null ? 0.0 : museum.longitude();

        double earthRadius = 6371.0;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        return earthRadius * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
    }
}
