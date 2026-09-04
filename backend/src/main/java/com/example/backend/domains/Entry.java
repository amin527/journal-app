package com.example.backend.domains;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Builder
@Table(name = "Entries")
public class Entry {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE)
    private Long id;
    @Lob
    @Column(columnDefinition = "TEXT")
    private String message;
    private LocalDateTime timestamp;
    @ManyToOne 
    @JoinColumn(name="user_id")
    private User user; 
    @ManyToOne 
    @JoinColumn(name="journal_id")
    private Journal journal;
}


