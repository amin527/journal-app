package com.example.backend.services;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.Base64;
import java.util.Date;
import java.util.Map;

import javax.crypto.SecretKey;

import org.junit.jupiter.api.Test;

import com.example.backend.domains.Role;
import com.example.backend.domains.User;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SignatureException;

class JwtServiceTest {

    private final JwtService jwtService = new JwtService();

    private static User user(String username) {
        return User.builder().id(1L).username(username).password("hashed").role(Role.USER).build();
    }

    private static SecretKey testKey() {
        return Keys.hmacShaKeyFor(Base64.getDecoder().decode(System.getenv("SECRET_KEY")));
    }

    @Test
    void generatedTokenCarriesTheUsernameAsSubject() {
        String token = jwtService.generateToken(user("amin@example.com"));

        assertThat(jwtService.extractUsername(token)).isEqualTo("amin@example.com");
    }

    @Test
    void generatedTokenIncludesExtraClaims() {
        String token = jwtService.generateToken(Map.of("role", "USER"), user("amin@example.com"));

        String role = jwtService.extractClaim(token, claims -> claims.get("role", String.class));

        assertThat(role).isEqualTo("USER");
    }

    @Test
    void generatedTokenExpiresAfterItWasIssued() {
        String token = jwtService.generateToken(user("amin@example.com"));

        Date issuedAt = jwtService.extractClaim(token, claims -> claims.getIssuedAt());
        Date expiration = jwtService.extractClaim(token, claims -> claims.getExpiration());

        assertThat(expiration).isAfter(issuedAt);
    }

    @Test
    void tokenIsValidForTheUserItWasIssuedTo() {
        User user = user("amin@example.com");
        String token = jwtService.generateToken(user);

        assertThat(jwtService.isTokenValid(token, user)).isTrue();
    }

    @Test
    void tokenIsNotValidForADifferentUser() {
        String token = jwtService.generateToken(user("amin@example.com"));

        assertThat(jwtService.isTokenValid(token, user("someone@example.com"))).isFalse();
    }

    @Test
    void expiredTokenIsRejected() {
        String expired = Jwts.builder()
                .subject("amin@example.com")
                .issuedAt(new Date(System.currentTimeMillis() - 120_000))
                .expiration(new Date(System.currentTimeMillis() - 60_000))
                .signWith(testKey(), Jwts.SIG.HS256)
                .compact();

        assertThatThrownBy(() -> jwtService.isTokenValid(expired, user("amin@example.com")))
                .isInstanceOf(ExpiredJwtException.class);
    }

    @Test
    void tokenSignedWithAnotherKeyIsRejected() {
        SecretKey otherKey = Keys.hmacShaKeyFor("a-completely-different-secret-key-value!".getBytes());
        String forged = Jwts.builder()
                .subject("amin@example.com")
                .expiration(new Date(System.currentTimeMillis() + 60_000))
                .signWith(otherKey, Jwts.SIG.HS256)
                .compact();

        assertThatThrownBy(() -> jwtService.extractUsername(forged)).isInstanceOf(SignatureException.class);
    }

    @Test
    void tamperedTokenIsRejected() {
        String token = jwtService.generateToken(user("amin@example.com"));
        String[] parts = token.split("\\.");
        String fakePayload = Base64.getUrlEncoder().withoutPadding()
                .encodeToString("{\"sub\":\"admin@example.com\"}".getBytes());
        String tampered = parts[0] + "." + fakePayload + "." + parts[2];

        assertThatThrownBy(() -> jwtService.extractUsername(tampered)).isInstanceOf(SignatureException.class);
    }
}
