package com.example.backend.helperObjects;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;

@AllArgsConstructor
@Data
public class UserData {
    private final String username;
    private final List<EntryInfo> entries;
    private final List<JournalInfo> journals;
}