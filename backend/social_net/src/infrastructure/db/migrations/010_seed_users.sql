INSERT INTO users (id, email, password_hash, nickname, verified)
VALUES
('99f2a4dc-3657-4891-839f-29b1397452a5', 'pmd.fizicon@gmail.com', '$2b$10$MOZLteb2Qf1z/29ONJPVOewEggC4y5nEatdCHJOwJBgj73xALYf62', 'micke', 't'),
('99f2a4dc-3657-4891-839f-29b1397452a6', 'test@gmail.com', '$2b$10$MOZLteb2Qf1z/29ONJPVOewEggC4y5nEatdCHJOwJBgj73xALYf62', 'vann', 't'),;
INSERT INTO posts(author_id, text_f) VALUES('99f2a4dc-3657-4891-839f-29b1397452a5', 'my first post');
INSERT INTO friendships(requester_id, addressee_id, status)  VALUES('99f2a4dc-3657-4891-839f-29b1397452a5','99f2a4dc-3657-4891-839f-29b1397452a6', 'accepted');
INSERT INTO messages(sender_id, receiver_user_id, text_f) VALUES('99f2a4dc-3657-4891-839f-29b1397452a5','99f2a4dc-3657-4891-839f-29b1397452a6', 'message from micke to vann');
INSERT INTO messages(sender_id, receiver_user_id, text_f) VALUES('99f2a4dc-3657-4891-839f-29b1397452a6','99f2a4dc-3657-4891-839f-29b1397452a5', 'message from vann to micke');