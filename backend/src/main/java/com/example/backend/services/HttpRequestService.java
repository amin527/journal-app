package com.example.backend.services;

import com.example.backend.domains.Entry;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import org.springframework.stereotype.Service;

import com.example.backend.domains.Journal;
import com.example.backend.domains.User;
import com.example.backend.helperObjects.EntryInfo;
import com.example.backend.helperObjects.JournalInfo;
import com.example.backend.helperObjects.UserData;
import com.example.backend.repositories.EntryRepository;
import com.example.backend.repositories.JournalRepository;
import com.example.backend.repositories.UserRepository;
import com.example.backend.requests.AddJournalEntryRequest;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class HttpRequestService {

    private final EntryRepository entryRepository;
    private final JournalRepository journalRepository;
    private final UserRepository userRepository;
    private final JwtService jwtService;

    @Transactional
    public Entry addEntry(AddJournalEntryRequest request, String authHeader) {
        final String jwt = authHeader.substring(7);
        final String username = jwtService.extractUsername(jwt);
        final User user = userRepository.findByUsername(username).orElseThrow();
        final Long journalId = request.getJournalId();
        final Journal journal = journalRepository.findById(journalId).orElseThrow();
        Entry entry = Entry.builder()
                .journal(journal)
                .message(request.getMessage())
                .timestamp(LocalDateTime.now())
                .user(user)
                .build();
        entryRepository.save(entry);
        return (entry);
    }
    
    @Transactional
    public UserData getUserInfo(String authHeader) {
        final String jwt = authHeader.substring(7);
        final String username = jwtService.extractUsername(jwt);
        User user = userRepository.findByUsername(username).orElseThrow();

        final List<Journal> journals = journalRepository.findByUserId(user.getId());
        List<JournalInfo> journalsInfoList = new ArrayList<>();
        for (Journal journal : journals) {
            JournalInfo journalInfo = new JournalInfo();
            journalInfo.setId(journal.getId());
            journalInfo.setName(journal.getName());
            journalInfo.setTimestamp(journal.getTimestamp());
            journalsInfoList.add(journalInfo);
        }
        final List<Entry> entries = entryRepository.findByUserId(user.getId());
        List<EntryInfo> entriesInfoList = new ArrayList<>();
        for (Entry entry : entries) {
            EntryInfo entryInfo = new EntryInfo();
            entryInfo.setJournalId(entry.getJournal().getId());
            entryInfo.setMessage(entry.getMessage());
            entryInfo.setTimestamp(entry.getTimestamp());
            entryInfo.setId(entry.getId());
            entriesInfoList.add(entryInfo);
        }
        return(new UserData(username, entriesInfoList, journalsInfoList));
    }
}
