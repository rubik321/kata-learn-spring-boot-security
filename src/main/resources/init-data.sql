INSERT INTO users(is_account_non_expired, is_account_non_locked, is_credentials_non_expired,
                  is_enabled, name, last_name, age, email, password)
VALUES (true, true, true, true, 'admin',  'admin', 23, 'admin@mail.ru', '$2a$12$75z.7nsZmoTnOvNEa8YZQuLYqlEitZsXAlgnUTf41Fc2et8e7KQCu');

INSERT INTO users(is_account_non_expired, is_account_non_locked, is_credentials_non_expired,
                  is_enabled, name, last_name, age, email, password)
VALUES (true, true, true, true, 'user',  'user', 23, 'user@mail.ru', '$2a$12$PidsYHIjULmccdZI8phoI.FrKOIsp7bXouznAxzQA1ILVz.O6f1My');

INSERT INTO roles(authority)
VALUES ('ROLE_ADMIN');

INSERT INTO roles(authority)
VALUES ('ROLE_USER');

INSERT INTO users_roles(user_id, role_id)
VALUES ((SELECT id FROM users WHERE email = 'admin@mail.ru'), (SELECT id FROM roles WHERE authority = 'ROLE_ADMIN'));
INSERT INTO users_roles(user_id, role_id)
VALUES ((SELECT id FROM users WHERE email = 'admin@mail.ru'), (SELECT id FROM roles WHERE authority = 'ROLE_USER'));

INSERT INTO users_roles(user_id, role_id)
VALUES ((SELECT id FROM users WHERE email = 'user@mail.ru'), (SELECT id FROM roles WHERE authority = 'ROLE_USER'));