package com.example.backend.domains;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class UserTest {

    @Test
    void authoritiesContainOnlyTheUsersRole() {
        User user = User.builder().username("amin@example.com").role(Role.ADMIN).build();

        assertThat(user.getAuthorities()).extracting("authority").containsExactly("ADMIN");
    }

    @Test
    void exposesUsernameAndPasswordForSpringSecurity() {
        User user = User.builder().username("amin@example.com").password("hashed").role(Role.USER).build();

        assertThat(user.getUsername()).isEqualTo("amin@example.com");
        assertThat(user.getPassword()).isEqualTo("hashed");
    }

    @Test
    void accountIsActiveByDefault() {
        User user = User.builder().username("amin@example.com").role(Role.USER).build();

        assertThat(user.isAccountNonExpired()).isTrue();
        assertThat(user.isAccountNonLocked()).isTrue();
        assertThat(user.isCredentialsNonExpired()).isTrue();
        assertThat(user.isEnabled()).isTrue();
    }
}
