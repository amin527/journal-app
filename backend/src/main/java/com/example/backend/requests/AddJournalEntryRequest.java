package com.example.backend.requests;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AddJournalEntryRequest {
    private String message;
    private LocalDateTime timestamp;
    private Long journalId;
    private Long userId;
}
