package com.example.backend.domains;

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
    private String entry;
    @ManyToOne (cascade = CascadeType.ALL)
    @JoinColumn(name="user_id")
    private User user; 
    @ManyToOne (cascade = CascadeType.ALL)
    @JoinColumn(name="journal_id")
    private Journal journal;
}


