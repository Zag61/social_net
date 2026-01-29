INSERT INTO users (id, email, password_hash, nickname, verified, avatar_file_id)
VALUES
('99f2a4dc-3657-4891-839f-29b1397452a5', 'pmd.fizicon@gmail.com', '$2b$10$MOZLteb2Qf1z/29ONJPVOewEggC4y5nEatdCHJOwJBgj73xALYf62', 'micke', 't', 'seed-files/Omnissiah.jpg'),
('99f2a4dc-3657-4891-839f-29b1397452a6', 'test@gmail.com', '$2b$10$MOZLteb2Qf1z/29ONJPVOewEggC4y5nEatdCHJOwJBgj73xALYf62', 'vann', 't', 'seed-files/cat.png'),
('99f2a4dc-3657-4891-839f-29b1397452a7', 'test@mail.com', '$2b$10$MOZLteb2Qf1z/29ONJPVOewEggC4y5nEatdCHJOwJBgj73xALYf62', 'daan', 't', 'seed-files/images.webp');
INSERT INTO posts(author_id, text_f) VALUES('99f2a4dc-3657-4891-839f-29b1397452a5', 'my first post');
INSERT INTO posts(author_id, text_f, attachments_present) VALUES('99f2a4dc-3657-4891-839f-29b1397452a6', 'vann first post', 'false');
INSERT INTO posts(author_id, id, text_f, attachments_present) VALUES('99f2a4dc-3657-4891-839f-29b1397452a6', 'd0ee5498-6b43-4a11-bdd5-bba1e97e7742','vann second post', 'true');
INSERT INTO files (id,owner_id,name,mime_type,backend,storage_bucket,storage_key)
VALUES ('f1111111-1111-1111-1111-111111111111','99f2a4dc-3657-4891-839f-29b1397452a5','Omnissiah','image/png','object_storage','social-net-files','seed-files/Omnissiah.jpg'),
('f1111111-1111-1111-1111-111111111112','99f2a4dc-3657-4891-839f-29b1397452a6','cat.png','image/png','object_storage','social-net-files','seed-files/cat.png'),
('f1111111-1111-1111-1111-111111111113','99f2a4dc-3657-4891-839f-29b1397452a7','images','image/png','object_storage','social-net-files','seed-files/images.webp'),
('f1111111-1111-1111-1111-111111111114','99f2a4dc-3657-4891-839f-29b1397452a6','wall','image/png','object_storage','social-net-files','seed-files/wall.jpg');
INSERT INTO files(owner_id, name, mime_type, storage_bucket, storage_key) 
VALUES('99f2a4dc-3657-4891-839f-29b1397452a5', 'немцы.mp4', 'video/mp4', 'social-net-files', 'seed-files/немцы.mp4');
INSERT INTO files(owner_id, name, mime_type, storage_bucket, storage_key) 
VALUES('99f2a4dc-3657-4891-839f-29b1397452a5', 'aud_eng.wav', 'audio/wav', 'social-net-files', 'seed-files/aud_eng.wav');
INSERT INTO post_files (post_id, file_id, ord)
VALUES('d0ee5498-6b43-4a11-bdd5-bba1e97e7742','f1111111-1111-1111-1111-111111111114',0);
INSERT INTO post_files (post_id, file_id, ord)
VALUES('67e8e09a-dfe1-4afa-862c-99b9a494477e','b76bde49-4fe2-4326-b6bc-75dee216493a',0);
INSERT INTO post_files (post_id, file_id, ord)
VALUES('67e8e09a-dfe1-4afa-862c-99b9a494477e','c870cb64-76dd-4d3b-a84d-7e3b3f96a6b2',0);
INSERT INTO friendships(requester_id, addressee_id, status)  VALUES('99f2a4dc-3657-4891-839f-29b1397452a5','99f2a4dc-3657-4891-839f-29b1397452a6', 'accepted');
INSERT INTO messages(sender_id, receiver_user_id, text_f) VALUES('99f2a4dc-3657-4891-839f-29b1397452a5','99f2a4dc-3657-4891-839f-29b1397452a6', 'message from micke to vann');
INSERT INTO messages(sender_id, receiver_user_id, text_f) VALUES('99f2a4dc-3657-4891-839f-29b1397452a6','99f2a4dc-3657-4891-839f-29b1397452a5', 'message from vann to micke');