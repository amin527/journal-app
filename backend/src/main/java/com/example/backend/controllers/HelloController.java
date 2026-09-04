package com.example.backend.controllers;

import java.time.LocalDateTime;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.domains.Journal;
import com.example.backend.domains.User;
import com.example.backend.helperObjects.UserData;
import com.example.backend.domains.Entry;
import com.example.backend.repositories.EntryRepository;
import com.example.backend.repositories.JournalRepository;
import com.example.backend.repositories.UserRepository;
import com.example.backend.requests.AddJournalEntryRequest;
import com.example.backend.requests.AddJournalRequest;
import com.example.backend.requests.DeleteRequest;
import com.example.backend.requests.EditRequest;
import com.example.backend.responses.AddEntryResponse;
import com.example.backend.responses.AddJournalResponse;
import com.example.backend.responses.GenericResponse;
import com.example.backend.responses.UserInfoResponse;
import com.example.backend.services.HttpRequestService;
import com.example.backend.services.JwtService;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class HelloController {

        private final EntryRepository entryRepository;
        private final JournalRepository journalRepository;
        private final UserRepository userRepository;
        private final JwtService jwtService;
        private final HttpRequestService httpRequestService;

        @GetMapping("/get-user-info") public ResponseEntity<UserInfoResponse> getUserInfo(@RequestHeader("Authorization") String authHeader) {
                UserData userdata = httpRequestService.getUserInfo(authHeader);
                return ResponseEntity.ok(UserInfoResponse.builder()
                                .username(userdata.getUsername())
                                .journals(userdata.getJournals())
                                .entries(userdata.getEntries())
                                .build());
        }

        @PostMapping("/add-journal")
        public ResponseEntity<AddJournalResponse> addJournal(@RequestBody AddJournalRequest request,
                        @RequestHeader("Authorization") String authHeader) {
                final String jwt = authHeader.substring(7);
                final String username = jwtService.extractUsername(jwt);
                User user = userRepository.findByUsername(username).orElseThrow();
                final String journalName = request.getJournalName();
                var journal = Journal.builder()
                                .name(journalName)
                                .timestamp(LocalDateTime.now())
                                .user(user)
                                .build();
                journalRepository.save(journal);
                return ResponseEntity.ok(
                                AddJournalResponse.builder()
                                                .message("Journal Saved")
                                                .journalId(journal.getId())
                                                .timestamp(journal.getTimestamp())
                                                .build());
        }

        @PostMapping("/delete-entry")
        public ResponseEntity<GenericResponse> deleteEntry(@RequestBody DeleteRequest request) {
                final Long entryId = request.getId();
                entryRepository.deleteById(entryId);
                return ResponseEntity.ok(
                                GenericResponse.builder()
                                                .message("Entry Deleted")
                                                .build());
        }

        @PostMapping("/delete-journal")
        public ResponseEntity<GenericResponse> deleteJournal(@RequestBody DeleteRequest request) {
                final Long journalId = request.getId();
                Journal journal = journalRepository.findById(journalId).orElseThrow();
                entryRepository.deleteByJournalId(journal.getId());
                journalRepository.delete(journal);
                return ResponseEntity.ok(
                                GenericResponse.builder()
                                                .message("Journal Deleted")
                                                .build());
        }

        @PostMapping("/edit-journal")
        public ResponseEntity<GenericResponse> editJournal(@RequestBody EditRequest request) {
                final Long journalId = request.getId();
                final String journalName = request.getNewValue();
                Journal journal = journalRepository.findById(journalId).orElseThrow();
                journal.setName(journalName);
                journalRepository.save(journal);
                return ResponseEntity.ok(
                                GenericResponse.builder()
                                                .message("Journal updated")
                                                .build());
        }

        @PostMapping("/edit-entry")
        public ResponseEntity<GenericResponse> editEntry(@RequestBody EditRequest request) {
                final Long entryId = request.getId();
                final String entryMessage = request.getNewValue();
                Entry entry = entryRepository.findById(entryId).orElseThrow();
                entry.setTimestamp(LocalDateTime.now());
                entry.setMessage(entryMessage);
                entryRepository.save(entry);
                return ResponseEntity.ok(
                                GenericResponse.builder()
                                                .message("Entry updated")
                                                .build());
        }

        @Transactional
        @PostMapping("/add-entry")
        public ResponseEntity<AddEntryResponse> addJournalEntry(@RequestBody AddJournalEntryRequest request, @RequestHeader("Authorization") String authHeader) {
                Entry entry = httpRequestService.addEntry(request, authHeader);
                return ResponseEntity.ok(
                                AddEntryResponse.builder()
                                                .id(entry.getId())
                                                .message("Entry Saved")
                                                .timestamp(entry.getTimestamp())
                                                .build());
        }
}
