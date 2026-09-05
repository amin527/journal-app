# Journal App

A full-stack journaling app demonstrating end-to-end web development: a Spring Boot/PostgreSQL backend handling JWT authentication, data persistence and CRUD operations through a RESTful API, with a React frontend providing persistent login and API integration.

**Stack:** Spring Boot 3.5.6 · Spring Security · JJWT 0.13.0 (HS256) · BCrypt · PostgreSQL + Spring Data JPA · Lombok — React 19.2 · React Router 7.9 · Context API · Create React App

---
## Noteworthy Features

- **Auth** — registration and login hash passwords with BCrypt (never stored in plain text) and issue a JWT on success, which the client then sends on future requests to prove identity.
- **Authorization** — every request is authorized independently via its JWT (no sessions to manage), verified by a filter that runs before any route handling occurs. CORS is configurable via environment.
- **Persistent login** — the JWT persists in `localStorage`. This means that closing and reopening the tab does not force a re-login; the application makes an API call on load which both confirms the session and pulls in the user's journals and entries.
- **Full CRUD** — journals and entries each support full create, read, update, and delete operations through dedicated REST endpoints.
- **Context menu** — a single `useClickOutside` hook powers the right-click menus across journals and entries, positioning each at its trigger and dismissing it when you click elsewhere.
