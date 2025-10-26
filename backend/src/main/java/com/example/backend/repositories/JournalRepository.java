package com.example.backend.repositories;
import com.example.backend.domains.Journal;

import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.repository.CrudRepository;

public interface JournalRepository extends CrudRepository<Journal, Long> {
    List<Journal> findByUserId(Long userId);
    Journal findByTimestamp(LocalDateTime timestamp);

    
}



