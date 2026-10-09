package com.musejourneyguide.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class MuseumControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void shouldServeMuseumDiscoveryPage() throws Exception {
        mockMvc.perform(get("/"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.TEXT_HTML))
                .andExpect(content().string(containsString("Stories worth")));
    }

    @Test
    void shouldReturnMuseums() throws Exception {
        mockMvc.perform(get("/api/museums"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").isNotEmpty());
    }

    @Test
    void shouldFilterMuseumsByQuery() throws Exception {
        mockMvc.perform(get("/api/museums").param("query", "shivaji"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Chhatrapati Shivaji Maharaj Vastu Sangrahalaya"));
    }

    @Test
    void shouldBuildTripPlan() throws Exception {
        mockMvc.perform(get("/api/trip-plan")
                        .param("city", "Mumbai")
                        .param("date", "2026-10-09"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].city").value("Mumbai"));
    }

    @Test
    void shouldAnswerMuseumQuestionsWithCurrentTimestamp() throws Exception {
        mockMvc.perform(post("/api/chat")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"message\":\"Is Gateway of India open today?\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.reply").value(org.hamcrest.Matchers.containsString("Gateway of India")))
                .andExpect(jsonPath("$.reply").value(org.hamcrest.Matchers.containsString("IST")))
                .andExpect(jsonPath("$.answeredAt").isNotEmpty())
                .andExpect(jsonPath("$.source").value("Museums in the current Muse collection"))
                .andExpect(jsonPath("$.contextMuseumId").value("mumbai-gateway"));
    }

    @Test
    void shouldAnswerFollowUpAboutThePreviouslyMentionedMuseum() throws Exception {
        mockMvc.perform(post("/api/chat")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"message\":\"What about tickets?\",\"contextMuseumId\":\"mumbai-gateway\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.reply").value(org.hamcrest.Matchers.containsString("₹150")))
                .andExpect(jsonPath("$.reply").value(org.hamcrest.Matchers.containsString("These listings differ")))
                .andExpect(jsonPath("$.contextMuseumId").value("mumbai-gateway"));
    }

    @Test
    void shouldPreferANewCityOverPreviousMuseumContext() throws Exception {
        mockMvc.perform(post("/api/chat")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"message\":\"What museums are in Pune?\",\"contextMuseumId\":\"mumbai-gateway\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.reply").value(org.hamcrest.Matchers.containsString("Pune Tribal and Folk Art Museum")))
                .andExpect(jsonPath("$.contextMuseumId").doesNotExist());
    }

    @Test
    void shouldRejectAnEmptyChatMessage() throws Exception {
        mockMvc.perform(post("/api/chat")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"message\":\"  \"}"))
                .andExpect(status().isBadRequest());
    }
}
