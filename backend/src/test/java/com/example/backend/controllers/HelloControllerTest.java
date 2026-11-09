package com.example.backend.controllers;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDateTime;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import com.example.backend.domains.Entry;
import com.example.backend.domains.Journal;
import com.example.backend.domains.Role;
import com.example.backend.domains.User;
import com.example.backend.helperObjects.EntryInfo;
import com.example.backend.helperObjects.JournalInfo;
import com.example.backend.helperObjects.UserData;
import com.example.backend.repositories.EntryRepository;
import com.example.backend.repositories.JournalRepository;
import com.example.backend.repositories.UserRepository;
import com.example.backend.requests.AddJournalEntryRequest;
import com.example.backend.services.HttpRequestService;
import com.example.backend.services.JwtService;

@ExtendWith(MockitoExtension.class)
class HelloControllerTest {

    private static final String AUTH_HEADER = "Bearer jwt-token";

    @Mock
    private EntryRepository entryRepository;
    @Mock
    private JournalRepository journalRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private JwtService jwtService;
    @Mock
    private HttpRequestService httpRequestService;

    @InjectMocks
    private HelloController controller;

    private MockMvc mockMvc;
    private User user;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(controller).build();
        user = User.builder().id(1L).username("amin@example.com").role(Role.USER).build();
    }

    private static String json(String body) {
        return body.replace('\'', '"');
    }

    @Test
    void getUserInfoReturnsTheUsersJournalsAndEntries() throws Exception {
        LocalDateTime time = LocalDateTime.of(2025, 1, 2, 10, 30);
        when(httpRequestService.getUserInfo(AUTH_HEADER)).thenReturn(new UserData(
                "amin@example.com",
                List.of(new EntryInfo(10L, "Hello", time, 100L)),
                List.of(new JournalInfo(10L, "Travel", time))));

        mockMvc.perform(get("/get-user-info").header("Authorization", AUTH_HEADER))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("amin@example.com"))
                .andExpect(jsonPath("$.journals[0].id").value(10))
                .andExpect(jsonPath("$.journals[0].name").value("Travel"))
                .andExpect(jsonPath("$.entries[0].id").value(100))
                .andExpect(jsonPath("$.entries[0].journalId").value(10))
                .andExpect(jsonPath("$.entries[0].message").value("Hello"));
    }

    @Test
    void getUserInfoRequiresTheAuthorizationHeader() throws Exception {
        mockMvc.perform(get("/get-user-info")).andExpect(status().isBadRequest());
    }

    @Test
    void addJournalSavesAJournalForTheTokenOwner() throws Exception {
        when(jwtService.extractUsername("jwt-token")).thenReturn("amin@example.com");
        when(userRepository.findByUsername("amin@example.com")).thenReturn(Optional.of(user));
        doAnswer(invocation -> {
            invocation.<Journal>getArgument(0).setId(10L);
            return invocation.getArgument(0);
        }).when(journalRepository).save(any(Journal.class));

        mockMvc.perform(post("/add-journal")
                        .header("Authorization", AUTH_HEADER)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json("{'journalName':'Travel'}")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Journal Saved"))
                .andExpect(jsonPath("$.journalId").value(10))
                .andExpect(jsonPath("$.timestamp").exists());

        ArgumentCaptor<Journal> saved = ArgumentCaptor.forClass(Journal.class);
        verify(journalRepository).save(saved.capture());
        assertThat(saved.getValue().getName()).isEqualTo("Travel");
        assertThat(saved.getValue().getUser()).isSameAs(user);
        assertThat(saved.getValue().getTimestamp()).isNotNull();
    }

    @Test
    void addJournalFailsWhenTheUserDoesNotExist() {
        when(jwtService.extractUsername("jwt-token")).thenReturn("ghost@example.com");
        when(userRepository.findByUsername("ghost@example.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> mockMvc.perform(post("/add-journal")
                        .header("Authorization", AUTH_HEADER)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json("{'journalName':'Travel'}"))))
                .hasRootCauseInstanceOf(NoSuchElementException.class);
        verify(journalRepository, never()).save(any());
    }

    @Test
    void deleteEntryDeletesByIdTheEntry() throws Exception {
        mockMvc.perform(post("/delete-entry").contentType(MediaType.APPLICATION_JSON).content(json("{'id':100}")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Entry Deleted"));

        verify(entryRepository).deleteById(100L);
    }

    @Test
    void deleteJournalDeletesItsEntriesAndThenTheJournal() throws Exception {
        Journal journal = Journal.builder().id(10L).name("Travel").user(user).build();
        when(journalRepository.findById(10L)).thenReturn(Optional.of(journal));

        mockMvc.perform(post("/delete-journal").contentType(MediaType.APPLICATION_JSON).content(json("{'id':10}")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Journal Deleted"));

        var order = org.mockito.Mockito.inOrder(entryRepository, journalRepository);
        order.verify(entryRepository).deleteByJournalId(10L);
        order.verify(journalRepository).delete(journal);
    }

    @Test
    void deleteJournalFailsForAnUnknownJournal() {
        when(journalRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> mockMvc.perform(
                        post("/delete-journal").contentType(MediaType.APPLICATION_JSON).content(json("{'id':99}"))))
                .hasRootCauseInstanceOf(NoSuchElementException.class);
        verify(entryRepository, never()).deleteByJournalId(any());
        verify(journalRepository, never()).delete(any());
    }

    @Test
    void editJournalRenamesTheJournal() throws Exception {
        Journal journal = Journal.builder().id(10L).name("Travel").user(user).build();
        when(journalRepository.findById(10L)).thenReturn(Optional.of(journal));

        mockMvc.perform(post("/edit-journal")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json("{'id':10,'newValue':'Holidays'}")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Journal updated"));

        assertThat(journal.getName()).isEqualTo("Holidays");
        verify(journalRepository).save(journal);
    }

    @Test
    void editJournalFailsForAnUnknownJournal() {
        when(journalRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> mockMvc.perform(post("/edit-journal")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json("{'id':99,'newValue':'Holidays'}"))))
                .hasRootCauseInstanceOf(NoSuchElementException.class);
        verify(journalRepository, never()).save(any());
    }

    @Test
    void editEntryUpdatesTheMessageAndTimestamp() throws Exception {
        LocalDateTime original = LocalDateTime.of(2025, 1, 1, 9, 0);
        Entry entry = Entry.builder().id(100L).message("Old").timestamp(original).user(user).build();
        when(entryRepository.findById(100L)).thenReturn(Optional.of(entry));

        mockMvc.perform(post("/edit-entry")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json("{'id':100,'newValue':'New text'}")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Entry updated"));

        assertThat(entry.getMessage()).isEqualTo("New text");
        assertThat(entry.getTimestamp()).isAfter(original);
        verify(entryRepository).save(entry);
    }

    @Test
    void editEntryFailsForAnUnknownEntry() {
        when(entryRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> mockMvc.perform(post("/edit-entry")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json("{'id':999,'newValue':'New text'}"))))
                .hasRootCauseInstanceOf(NoSuchElementException.class);
        verify(entryRepository, never()).save(any());
    }

    @Test
    void addEntryReturnsTheSavedEntrysIdAndTimestamp() throws Exception {
        Entry saved = Entry.builder().id(100L).message("Hello").timestamp(LocalDateTime.of(2025, 1, 2, 10, 30)).build();
        when(httpRequestService.addEntry(new AddJournalEntryRequest("Hello", null, 10L, null), AUTH_HEADER))
                .thenReturn(saved);

        mockMvc.perform(post("/add-entry")
                        .header("Authorization", AUTH_HEADER)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json("{'message':'Hello','journalId':10}")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(100))
                .andExpect(jsonPath("$.message").value("Entry Saved"))
                .andExpect(jsonPath("$.timestamp").exists());
    }
}
