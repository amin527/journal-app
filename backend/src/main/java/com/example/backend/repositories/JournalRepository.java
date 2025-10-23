package com.example.backend.repositories;
import com.example.backend.domains.Journal;
import org.springframework.data.repository.CrudRepository;

public interface JournalRepository extends CrudRepository<Journal, Long> {
    
}



