package com.example.backend.responses;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;
import java.util.List;

import com.example.backend.helperObjects.EntryInfo;
import com.example.backend.helperObjects.JournalInfo;

@Data
@SuperBuilder
@EqualsAndHashCode(callSuper = false)
@AllArgsConstructor
@NoArgsConstructor
public class UserInfoResponse extends GenericResponse {
    private String username;
    private List<JournalInfo> journals;
    private List<EntryInfo> entries;
}