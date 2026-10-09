package com.musejourneyguide.service;

import com.musejourneyguide.model.ChatResponse;
import com.musejourneyguide.model.Museum;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.format.TextStyle;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class MuseumChatbotService {

    private static final ZoneId MUSEUM_TIME_ZONE = ZoneId.of("Asia/Kolkata");
    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("EEEE, d MMMM", Locale.ENGLISH);
    private static final Pattern TIME_RANGE = Pattern.compile(
            "(\\d{1,2})(?::(\\d{2}))?\\s*(AM|PM)\\s*[-–]\\s*(\\d{1,2})(?::(\\d{2}))?\\s*(AM|PM)",
            Pattern.CASE_INSENSITIVE
    );
    private static final Pattern CONTEXTUAL_FOLLOW_UP = Pattern.compile(
            "(?<![a-z])(?:it|its|there|that|those|them)(?![a-z])|^\\s*(?:and|also|what about|how much|how about)\\b",
            Pattern.CASE_INSENSITIVE
    );

    private final MuseumService museumService;

    public MuseumChatbotService(MuseumService museumService) {
        this.museumService = museumService;
    }

    public ChatResponse answer(String message, String contextMuseumId) {
        String query = message.trim();
        String normalized = query.toLowerCase(Locale.ROOT);
        OffsetDateTime answeredAt = OffsetDateTime.now(MUSEUM_TIME_ZONE).withNano(0);
        Optional<Museum> museum = findMuseum(normalized);
        if (museum.isEmpty() && !mentionsCity(normalized) && isContextualFollowUp(normalized)) {
            museum = museumService.findById(contextMuseumId == null ? "" : contextMuseumId);
        }
        Optional<Museum> answerMuseum = museum;
        String reply = answerMuseum
                .map(item -> answerAboutMuseum(item, normalized, answeredAt))
                .orElseGet(() -> answerGeneral(normalized, answeredAt));
        return new ChatResponse(reply, answeredAt, "Museums in the current Muse collection",
                answerMuseum.map(Museum::id).orElse(null));
    }

    private boolean isContextualFollowUp(String query) {
        return CONTEXTUAL_FOLLOW_UP.matcher(query).find();
    }

    private boolean mentionsCity(String query) {
        return museumService.findAll().stream()
                .map(Museum::city)
                .anyMatch(city -> query.contains(city.toLowerCase(Locale.ROOT)));
    }

    private Optional<Museum> findMuseum(String query) {
        return museumService.findAll().stream()
                .filter(museum -> query.contains(museum.name().toLowerCase(Locale.ROOT)))
                .findFirst();
    }

    private String answerAboutMuseum(Museum museum, String query, OffsetDateTime now) {
        boolean asksHours = containsAny(query, "open", "closed", "hours", "timing", "today", "now");
        if (asksHours) {
            return currentHours(museum, now);
        }

        boolean asksPrice = containsAny(query, "price", "fee", "ticket", "cost", "entry");
        if (asksPrice) {
            String adultPrice = museum.pricing() == null ? null : museum.pricing().adult();
            String childPrice = museum.pricing() == null ? null : museum.pricing().child();
            String listedEntryFee = valueOr(museum.entryFee(), "not provided");
            String ticketDetails = adultPrice == null || adultPrice.isBlank()
                    ? "Entry is listed as " + listedEntryFee + "."
                    : "The general listing says entry is " + listedEntryFee
                    + ", while detailed adult ticket pricing says " + adultPrice
                    + (childPrice == null || childPrice.isBlank() ? "." : " and child pricing says " + childPrice + ".")
                    + (listedEntryFee.equalsIgnoreCase(adultPrice) ? "" : " These listings differ.");
            return museum.name() + " " + ticketDetails
                    + " Check the official site for current ticket rules and availability: "
                    + valueOr(museum.bookingLink(), "not provided") + ".";
        }

        if (containsAny(query, "address", "location", "where", "directions")) {
            return museum.name() + " is in " + museum.city() + ": "
                    + valueOr(museum.address(), "an address is not listed")
                    + (museum.latitude() != null && museum.longitude() != null
                    ? ". Map coordinates: " + museum.latitude() + ", " + museum.longitude()
                    : "") + ".";
        }

        return museum.name() + " is a " + valueOr(museum.type(), "museum") + " in " + museum.city()
                + ". " + valueOr(museum.description(), "")
                + " Listed hours: " + valueOr(museum.timings(), "not provided")
                + ". Entry: " + valueOr(museum.entryFee(), "check with the museum")
                + ". Official information: " + valueOr(museum.bookingLink(), "not provided") + ".";
    }

    private String currentHours(Museum museum, OffsetDateTime now) {
        LocalDate today = now.toLocalDate();
        String day = today.getDayOfWeek().getDisplayName(TextStyle.FULL, Locale.ENGLISH).toLowerCase(Locale.ROOT);
        Map<String, String> timings = museum.detailedTimings();
        String todaysHours = timings == null ? null : timings.get(day);
        if (todaysHours == null || todaysHours.isBlank()) {
            todaysHours = museum.timings();
        }

        if (todaysHours == null || todaysHours.isBlank()) {
            return "I don't have today's opening hours for " + museum.name()
                    + ". Please check the museum's official site: " + valueOr(museum.bookingLink(), "not provided") + ".";
        }

        String prefix = "As of " + now.format(DateTimeFormatter.ofPattern("h:mm a", Locale.ENGLISH))
                + " IST on " + today.format(DATE_FORMAT) + ", ";
        if (todaysHours.toLowerCase(Locale.ROOT).contains("closed")) {
            return prefix + museum.name() + " is listed as closed today. Opening information: "
                    + todaysHours + ". Check for holiday changes: " + valueOr(museum.bookingLink(), "not provided") + ".";
        }

        Optional<LocalTime[]> range = parseTimeRange(todaysHours);
        if (range.isEmpty()) {
            return "Today's listed hours for " + museum.name() + " are " + todaysHours
                    + ". I can't confirm live entry availability, so please verify with the museum: "
                    + valueOr(museum.bookingLink(), "not provided") + ".";
        }

        LocalTime currentTime = now.toLocalTime();
        LocalTime opensAt = range.get()[0];
        LocalTime closesAt = range.get()[1];
        String status;
        if (currentTime.isBefore(opensAt)) {
            status = "is not open yet; it opens at " + opensAt.format(DateTimeFormatter.ofPattern("h:mm a", Locale.ENGLISH));
        } else if (currentTime.isBefore(closesAt)) {
            status = "is listed as open until " + closesAt.format(DateTimeFormatter.ofPattern("h:mm a", Locale.ENGLISH));
        } else {
            status = "is listed as closed for the day";
        }
        return prefix + museum.name() + " " + status + " (today's listed hours: " + todaysHours
                + "). This is based on published hours, not a live confirmation from the museum. Check "
                + valueOr(museum.bookingLink(), "the official site") + " for holiday changes.";
    }

    private Optional<LocalTime[]> parseTimeRange(String timings) {
        Matcher matcher = TIME_RANGE.matcher(timings);
        if (!matcher.find()) {
            return Optional.empty();
        }
        try {
            LocalTime opensAt = toLocalTime(matcher.group(1), matcher.group(2), matcher.group(3));
            LocalTime closesAt = toLocalTime(matcher.group(4), matcher.group(5), matcher.group(6));
            return Optional.of(new LocalTime[]{opensAt, closesAt});
        } catch (NumberFormatException | java.time.DateTimeException exception) {
            return Optional.empty();
        }
    }

    private LocalTime toLocalTime(String hourText, String minuteText, String meridiemText) {
        int hour = Integer.parseInt(hourText) % 12;
        int minute = minuteText == null ? 0 : Integer.parseInt(minuteText);
        if ("PM".equalsIgnoreCase(meridiemText)) {
            hour += 12;
        }
        return LocalTime.of(hour, minute);
    }

    private String answerGeneral(String query, OffsetDateTime now) {
        if (containsAny(query, "help", "what can you do", "hello", "hi", "hey")) {
            return "Hello! Ask me about a museum by name, such as its hours today, ticket price, address, or highlights. "
                    + "I can also suggest museums in a city. I use this app's museum collection and current India date/time; "
                    + "I don't have external live web search.";
        }

        Optional<String> city = museumService.findAll().stream()
                .map(Museum::city)
                .filter(name -> query.contains(name.toLowerCase(Locale.ROOT)))
                .findFirst();
        if (city.isPresent()) {
            List<Museum> inCity = museumService.findAll().stream()
                    .filter(museum -> museum.city().equalsIgnoreCase(city.get()))
                    .toList();
            if (containsAny(query, "open", "closed", "hours", "timing", "today", "now")) {
                return "Today's published opening information for " + city.get() + ":\n"
                        + inCity.stream()
                        .map(museum -> currentHours(museum, now))
                        .collect(Collectors.joining("\n"));
            }
            String listings = inCity.stream()
                    .map(museum -> museum.name() + " (" + valueOr(museum.type(), "Museum") + ")")
                    .collect(Collectors.joining("; "));
            return "The Muse collection currently lists these places in " + city.get() + ": " + listings
                    + ". Ask about any museum for its published details or today's listed hours.";
        }

        if (containsAny(query, "recommend", "suggest", "museum", "museums", "visit", "trip")) {
            String recommendations = museumService.findAll().stream()
                    .limit(4)
                    .map(museum -> museum.name() + " in " + museum.city())
                    .collect(Collectors.joining("; "));
            return "Here are a few places in the current collection: " + recommendations
                    + ". Tell me a city, or ask about a museum by name.";
        }

        return "I can answer from the museum information in this app, but I couldn't match that to a museum. "
                + "Try asking about a listed museum's hours, ticket price, address, or about museums in Mumbai, Pune, "
                + "Nagpur, Aurangabad, or Kolhapur. Answers are based on the app's collection, not live web search. "
                + "Checked at " + now.format(DateTimeFormatter.ofPattern("h:mm a 'IST'", Locale.ENGLISH)) + ".";
    }

    private boolean containsAny(String text, String... terms) {
        for (String term : terms) {
            if (text.contains(term)) {
                return true;
            }
        }
        return false;
    }

    private String valueOr(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value;
    }
}
