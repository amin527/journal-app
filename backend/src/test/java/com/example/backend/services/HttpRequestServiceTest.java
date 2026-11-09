package com.example.backend.services;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

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

@ExtendWith(MockitoExtension.class)
class HttpRequestServiceTest {

    private static final String AUTH_HEADER = "Bearer jwt-token";

    @Mock
    private EntryRepository entryRepository;
    @Mock
    private JournalRepository journalRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private JwtService jwtService;

    @InjectMocks
    private HttpRequestService service;

    private User user;
    private Journal journal;

    @BeforeEach
    void setUp() {
        user = User.builder().id(1L).username("amin@example.com").role(Role.USER).build();
        journal = Journal.builder().id(10L).name("Travel").timestamp(LocalDateTime.of(2025, 1, 1, 9, 0)).user(user).build();
    }

    @Test
    void addEntrySavesAnEntryForTheTokenOwnerInTheRequestedJournal() {
        when(jwtService.extractUsername("jwt-token")).thenReturn("amin@example.com");
        when(userRepository.findByUsername("amin@example.com")).thenReturn(Optional.of(user));
        when(journalRepository.findById(10L)).thenReturn(Optional.of(journal));
        AddJournalEntryRequest request = AddJournalEntryRequest.builder().message("Hello").journalId(10L).build();

        LocalDateTime before = LocalDateTime.now();
        Entry result = service.addEntry(request, AUTH_HEADER);

        ArgumentCaptor<Entry> saved = ArgumentCaptor.forClass(Entry.class);
        verify(entryRepository).save(saved.capture());
        assertThat(saved.getValue()).isSameAs(result);
        assertThat(result.getMessage()).isEqualTo("Hello");
        assertThat(result.getUser()).isSameAs(user);
        assertThat(result.getJournal()).isSameAs(journal);
        assertThat(result.getTimestamp()).isAfterOrEqualTo(before);
    }

    @Test
    void addEntryFailsWhenTheUserDoesNotExist() {
        when(jwtService.extractUsername("jwt-token")).thenReturn("ghost@example.com");
        when(userRepository.findByUsername("ghost@example.com")).thenReturn(Optional.empty());
        AddJournalEntryRequest request = AddJournalEntryRequest.builder().message("Hello").journalId(10L).build();

        assertThatThrownBy(() -> service.addEntry(request, AUTH_HEADER)).isInstanceOf(NoSuchElementException.class);
        verify(entryRepository, never()).save(any());
    }

    @Test
    void addEntryFailsWhenTheJournalDoesNotExist() {
        when(jwtService.extractUsername("jwt-token")).thenReturn("amin@example.com");
        when(userRepository.findByUsername("amin@example.com")).thenReturn(Optional.of(user));
        when(journalRepository.findById(99L)).thenReturn(Optional.empty());
        AddJournalEntryRequest request = AddJournalEntryRequest.builder().message("Hello").journalId(99L).build();

        assertThatThrownBy(() -> service.addEntry(request, AUTH_HEADER)).isInstanceOf(NoSuchElementException.class);
        verify(entryRepository, never()).save(any());
    }

    @Test
    void getUserInfoMapsTheUsersJournalsAndEntries() {
        LocalDateTime entryTime = LocalDateTime.of(2025, 1, 2, 10, 30);
        Entry entry = Entry.builder().id(100L).message("Hello").timestamp(entryTime).journal(journal).user(user).build();
        when(jwtService.extractUsername("jwt-token")).thenReturn("amin@example.com");
        when(userRepository.findByUsername("amin@example.com")).thenReturn(Optional.of(user));
        when(journalRepository.findByUserId(1L)).thenReturn(List.of(journal));
        when(entryRepository.findByUserId(1L)).thenReturn(List.of(entry));

        UserData result = service.getUserInfo(AUTH_HEADER);

        assertThat(result.getUsername()).isEqualTo("amin@example.com");
        assertThat(result.getJournals()).containsExactly(new JournalInfo(10L, "Travel", journal.getTimestamp()));
        assertThat(result.getEntries()).containsExactly(new EntryInfo(10L, "Hello", entryTime, 100L));
    }

    @Test
    void getUserInfoReturnsEmptyListsForANewUser() {
        when(jwtService.extractUsername("jwt-token")).thenReturn("amin@example.com");
        when(userRepository.findByUsername("amin@example.com")).thenReturn(Optional.of(user));
        when(journalRepository.findByUserId(1L)).thenReturn(List.of());
        when(entryRepository.findByUserId(1L)).thenReturn(List.of());

        UserData result = service.getUserInfo(AUTH_HEADER);

        assertThat(result.getJournals()).isEmpty();
        assertThat(result.getEntries()).isEmpty();
    }

    @Test
    void getUserInfoFailsWhenTheUserDoesNotExist() {
        when(jwtService.extractUsername("jwt-token")).thenReturn("ghost@example.com");
        when(userRepository.findByUsername("ghost@example.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.getUserInfo(AUTH_HEADER)).isInstanceOf(NoSuchElementException.class);
    }
}
