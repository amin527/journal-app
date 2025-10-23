package com.example.backend.responses;

import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@SuperBuilder
@AllArgsConstructor
@NoArgsConstructor
public class UserInfoResponse extends GenericResponse {
    private String username;
    private String journal_title;
}
