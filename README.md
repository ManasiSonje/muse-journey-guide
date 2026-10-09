# Muse Journey Guide

A Java 17 and Spring Boot museum discovery application for Maharashtra, with museum search, trip planning, and MuseMate chat.

## Run locally

Requirements: Java 17+ and Maven 3.8+.

```bash
mvn spring-boot:run
```

Open [http://localhost:8080](http://localhost:8080).

## Features

- Responsive museum discovery page with city/category filters and search.
- Museum details endpoint: `GET /api/museums` and `GET /api/museums/{id}`.
- Trip suggestions: `GET /api/trip-plan?city=Mumbai&date=2026-10-09`.
- MuseMate chat: `POST /api/chat` with JSON such as `{"message":"Is Gateway of India open today?"}`.
- Chat follow-ups can include the previous response's `contextMuseumId`.

MuseMate answers from the museum collection bundled in the application and timestamps responses in India Standard Time. Opening hours and ticket prices are published app data, not live confirmations from museums; the chatbot does not perform external web search.

## Tests

```bash
mvn test
```
