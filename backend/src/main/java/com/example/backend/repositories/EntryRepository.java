package com.example.backend.repositories;

import com.example.backend.domains.Entry;

import jakarta.transaction.Transactional;

import java.util.List;

import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;

public interface EntryRepository extends CrudRepository<Entry, Long> {
    List<Entry> findByUserId(Long userId);

    List<Entry> findByJournalId(Long journalId);

    @Modifying
    @Transactional 
    @Query("DELETE FROM Entry e WHERE e.journal.id = :journalId")
    void deleteByJournalId(@Param("journalId") Long journalId);
}
