DROP TABLE IF EXISTS books;
DROP TABLE IF EXISTS authors;
DROP SEQUENCE IF EXISTS authors_id_seq;

CREATE SEQUENCE authors_id_seq START 1;

CREATE TABLE authors (
    id BIGINT DEFAULT nextval('authors_id_seq') NOT NULL,
    name TEXT,
    age INTEGER,
    CONSTRAINT authors_pkey PRIMARY KEY (id)
);

CREATE TABLE books (
    isbn TEXT PRIMARY KEY,
    title TEXT,
    author_id BIGINT,
    CONSTRAINT fk_author FOREIGN KEY (author_id) REFERENCES authors(id)
);
