package com.example.backend.helperObjects;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class EntryInfo {
    private Long journalId;
    private String message;
    private LocalDateTime timestamp;
    private Long id;
}