-- Load-test seed. Run ONCE in the Supabase SQL editor (or psql).
--
-- Creates:
--   * one isolated college "LoadTest College" (domain loadtest.invalid), so matching
--     pools never mix with real students
--   * N users lt+1..lt+N@loadtest.invalid — email-verified, APPROVED, profile 100%,
--     all in that college, all with the same password
--   * every user: SHORT_TERM project type + 1 short-term interest + SHORT_GROUP
--   * users 1..LONG_TERM_COHORT also get a LONG_TERM project type + 1 long-term
--     interest (no long-term connection type, so /matches/find never runs long-term
--     matching for them; they exist for the seriousness-test scenario only)
--
-- Nothing here can send email: the addresses use the reserved .invalid TLD.
-- Idempotent: safe to re-run; it skips rows that already exist.
-- Wrap in BEGIN; ... ROLLBACK; first if you want a dry run.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
    user_count      int  := 600;   -- keep in sync with USER_COUNT in loadtest/lib/config.js
    long_term_count int  := 100;   -- users 1..100 also get a long-term interest
    test_password   text := 'LoadTest#2026';   -- keep in sync with LT_PASSWORD
    college         uuid;
    pw_hash         text;
    short_ids       uuid[];
    long_ids        uuid[];
BEGIN
    SELECT array_agg(id ORDER BY display_order, name) INTO short_ids
      FROM interests WHERE category = 'SHORT_TERM' AND active;
    SELECT array_agg(id ORDER BY display_order, name) INTO long_ids
      FROM interests WHERE category = 'LONG_TERM' AND active;

    IF short_ids IS NULL OR long_ids IS NULL THEN
        RAISE EXCEPTION 'No active short-term / long-term interests found. Add them in the admin panel first.';
    END IF;

    INSERT INTO colleges (id, created_at, name, email_domain, city, active)
    SELECT gen_random_uuid(), now(), 'LoadTest College', 'loadtest.invalid', 'Testville', true
    WHERE NOT EXISTS (SELECT 1 FROM colleges WHERE email_domain = 'loadtest.invalid');
    SELECT id INTO college FROM colleges WHERE email_domain = 'loadtest.invalid';

    -- One bcrypt hash for everyone (crypt() is deliberately slow). Spring's
    -- BCryptPasswordEncoder accepts pgcrypto's $2a$ hashes.
    pw_hash := crypt(test_password, gen_salt('bf', 10));

    INSERT INTO users (
        id, created_at, college_id, email, name, password_hash, email_verified,
        profile_photo_url, year_of_study, city, course,
        story_prompt_1, story_prompt_2, story_prompt_3,
        profile_completed, verification_status,
        notifications_enabled, profile_visible, account_status, last_seen_at, updated_at
    )
    SELECT gen_random_uuid(), now(), college,
           'lt+' || i || '@loadtest.invalid', 'Load Tester ' || i, pw_hash, true,
           'https://loadtest.invalid/p.png', 1 + (i % 4), 'Testville', 'Computer Science',
           'Load test story one', 'Load test story two', 'Load test story three',
           true, 'APPROVED',
           true, true, 'ACTIVE', now(), now()
      FROM generate_series(1, user_count) AS i
     WHERE NOT EXISTS (SELECT 1 FROM users u WHERE u.email = 'lt+' || i || '@loadtest.invalid');

    -- SHORT_TERM for everyone
    INSERT INTO user_project_type_selections (id, created_at, user_id, project_type)
    SELECT gen_random_uuid(), now(), u.id, 'SHORT_TERM'
      FROM users u WHERE u.college_id = college
       AND NOT EXISTS (SELECT 1 FROM user_project_type_selections s WHERE s.user_id = u.id AND s.project_type = 'SHORT_TERM');

    INSERT INTO user_interest_selections (id, created_at, user_id, interest_id, project_type, sub_tag)
    SELECT gen_random_uuid(), now(), u.id,
           short_ids[1 + (substring(u.email from 'lt\+(\d+)@')::int % array_length(short_ids, 1))],
           'SHORT_TERM', NULL
      FROM users u WHERE u.college_id = college
       AND NOT EXISTS (SELECT 1 FROM user_interest_selections s WHERE s.user_id = u.id AND s.project_type = 'SHORT_TERM');

    INSERT INTO connection_type_selections (id, created_at, user_id, project_type, connection_type)
    SELECT gen_random_uuid(), now(), u.id, 'SHORT_TERM', 'SHORT_GROUP'
      FROM users u WHERE u.college_id = college
       AND NOT EXISTS (SELECT 1 FROM connection_type_selections s WHERE s.user_id = u.id AND s.project_type = 'SHORT_TERM');

    -- LONG_TERM cohort (seriousness-test scenario only)
    INSERT INTO user_project_type_selections (id, created_at, user_id, project_type)
    SELECT gen_random_uuid(), now(), u.id, 'LONG_TERM'
      FROM users u WHERE u.college_id = college
       AND substring(u.email from 'lt\+(\d+)@')::int <= long_term_count
       AND NOT EXISTS (SELECT 1 FROM user_project_type_selections s WHERE s.user_id = u.id AND s.project_type = 'LONG_TERM');

    INSERT INTO user_interest_selections (id, created_at, user_id, interest_id, project_type, sub_tag)
    SELECT gen_random_uuid(), now(), u.id,
           long_ids[1 + (substring(u.email from 'lt\+(\d+)@')::int % array_length(long_ids, 1))],
           'LONG_TERM', NULL
      FROM users u WHERE u.college_id = college
       AND substring(u.email from 'lt\+(\d+)@')::int <= long_term_count
       AND NOT EXISTS (SELECT 1 FROM user_interest_selections s WHERE s.user_id = u.id AND s.project_type = 'LONG_TERM');

    RAISE NOTICE 'Seeded % load-test users in college %', user_count, college;
END $$;

-- Sanity checks — eyeball these before running k6:
SELECT count(*) AS test_users FROM users WHERE email LIKE 'lt+%@loadtest.invalid';
SELECT verification_status, profile_completed, count(*) FROM users WHERE email LIKE 'lt+%@loadtest.invalid' GROUP BY 1, 2;
SELECT i.name, i.category, count(*) AS users
  FROM user_interest_selections s JOIN interests i ON i.id = s.interest_id
  JOIN users u ON u.id = s.user_id WHERE u.email LIKE 'lt+%@loadtest.invalid' GROUP BY 1, 2 ORDER BY 2, 1;
-- Long-term interests need question banks for the seriousness test:
SELECT i.name, count(q.*) AS questions FROM interests i
  LEFT JOIN seriousness_test_questions q ON q.interest_id = i.id
 WHERE i.category = 'LONG_TERM' AND i.active GROUP BY 1 ORDER BY 1;
