-- Removes EVERYTHING the load test created. Run in the Supabase SQL editor after testing.
--
-- Scope is strictly the load-test college (domain loadtest.invalid) and users whose
-- email is lt+N@loadtest.invalid. Real students are never touched: matching is scoped
-- per college, so no real user can be in a group belonging to the test college.
--
-- Note: the app's own "delete account" removes users but leaves match groups and chat
-- rooms behind, so this script deletes those explicitly, children first.

BEGIN;

CREATE TEMP TABLE lt_users ON COMMIT DROP AS
    SELECT id, email FROM users WHERE email LIKE 'lt+%@loadtest.invalid';

CREATE TEMP TABLE lt_groups ON COMMIT DROP AS
    SELECT g.id FROM match_groups g JOIN colleges c ON c.id = g.college_id
     WHERE c.email_domain = 'loadtest.invalid';

CREATE TEMP TABLE lt_rooms ON COMMIT DROP AS
    SELECT id FROM chat_rooms WHERE match_group_id IN (SELECT id FROM lt_groups);

-- chat
DELETE FROM message_receipts WHERE message_id IN (SELECT id FROM chat_messages WHERE chat_room_id IN (SELECT id FROM lt_rooms));
DELETE FROM message_receipts WHERE user_id IN (SELECT id FROM lt_users);
DELETE FROM chat_messages    WHERE chat_room_id IN (SELECT id FROM lt_rooms);
DELETE FROM chat_messages    WHERE sender_id    IN (SELECT id FROM lt_users);
DELETE FROM chat_rooms       WHERE id IN (SELECT id FROM lt_rooms);

-- matching
DELETE FROM match_members WHERE match_group_id IN (SELECT id FROM lt_groups);
DELETE FROM match_members WHERE user_id IN (SELECT id FROM lt_users);
DELETE FROM match_groups  WHERE id IN (SELECT id FROM lt_groups);

-- seriousness test
DELETE FROM seriousness_test_answers
 WHERE attempt_id IN (SELECT id FROM seriousness_test_attempts WHERE user_id IN (SELECT id FROM lt_users));
DELETE FROM seriousness_test_attempt_questions
 WHERE attempt_id IN (SELECT id FROM seriousness_test_attempts WHERE user_id IN (SELECT id FROM lt_users));
DELETE FROM seriousness_test_attempts WHERE user_id IN (SELECT id FROM lt_users);

-- everything else keyed by user
DELETE FROM notifications              WHERE user_id IN (SELECT id FROM lt_users);
DELETE FROM refresh_tokens             WHERE user_id IN (SELECT id FROM lt_users);
DELETE FROM device_tokens              WHERE user_id IN (SELECT id FROM lt_users);
DELETE FROM verification_documents     WHERE user_id IN (SELECT id FROM lt_users);
DELETE FROM interest_feedback          WHERE user_id IN (SELECT id FROM lt_users);
DELETE FROM user_interest_selections   WHERE user_id IN (SELECT id FROM lt_users);
DELETE FROM connection_type_selections WHERE user_id IN (SELECT id FROM lt_users);
DELETE FROM user_project_type_selections WHERE user_id IN (SELECT id FROM lt_users);
DELETE FROM blocks_reports WHERE reporter_id IN (SELECT id FROM lt_users) OR reported_id IN (SELECT id FROM lt_users);
DELETE FROM otp_codes WHERE lower(email) IN (SELECT lower(email) FROM lt_users);

DELETE FROM users    WHERE id IN (SELECT id FROM lt_users);
DELETE FROM colleges WHERE email_domain = 'loadtest.invalid';

COMMIT;

-- All of these should be 0:
SELECT (SELECT count(*) FROM users WHERE email LIKE 'lt+%@loadtest.invalid') AS users_left,
       (SELECT count(*) FROM colleges WHERE email_domain = 'loadtest.invalid') AS colleges_left;
