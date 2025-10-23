package com.example.backend.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.example.backend.repositories.EntryRepository;
import com.example.backend.repositories.JournalRepository;
import com.example.backend.repositories.UserRepository;
import com.example.backend.requests.NewJournalEntryRequest;
import com.example.backend.responses.GenericResponse;
import com.example.backend.responses.UserInfoResponse;
import com.example.backend.services.JwtService;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class HelloController {

    private final EntryRepository entryRepository;
    private final JournalRepository journalRepository;
    private final UserRepository userRepository;
    private final JwtService jwtService;

    @GetMapping("/get-user-info")
    public ResponseEntity<UserInfoResponse> getUserInfo(@RequestHeader("Authorization") String authHeader) {
        final String jwt = authHeader.substring(7);
        final String username = jwtService.extractUsername(jwt);

        return ResponseEntity.ok(UserInfoResponse.builder()
                .username(username)
                .build());
    }

    @PostMapping("/add-entry")
    public ResponseEntity<GenericResponse> addJournalEntry(@RequestBody NewJournalEntryRequest request, @RequestHeader("Authorization") String authHeader){
        final String jwt = authHeader.substring(7);
        final String username = jwtService.extractUsername(jwt);
        return null;
    }
}
