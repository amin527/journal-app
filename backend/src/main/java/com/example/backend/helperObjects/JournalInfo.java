package com.example.backend.helperObjects;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class JournalInfo {
    private Long id;
    private String name;
    private LocalDateTime timestamp;
}