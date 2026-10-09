package com.musejourneyguide.model;

import java.time.OffsetDateTime;

public record ChatResponse(String reply, OffsetDateTime answeredAt, String source, String contextMuseumId) {
}
