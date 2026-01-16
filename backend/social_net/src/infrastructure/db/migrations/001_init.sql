-- ============================
-- DDL: Social network (hybrid files) + user personal pages + "Избранное" (папки)
-- Комментарии внутри SQL — никаких дополнительных пояснений вне скрипта.
-- Выполнить в чистой БД или адаптировать в существующей (вставки/ALTER по необходимости).
-- ============================

-- Расширения
CREATE EXTENSION IF NOT EXISTS "pgcrypto"; -- gen_random_uuid()

-- Типы
CREATE TYPE storage_backend AS ENUM ('db','object_storage'); -- Ceph (RADOS GW), AWS S3, GCS, etc.);
CREATE TYPE friendship_status AS ENUM ('pending', 'accepted', 'rejected', 'blocked');
CREATE TYPE like_target AS ENUM ('post', 'comment');
CREATE TYPE saved_target AS ENUM ('post', 'comment', 'message', 'file', 'channel', 'user', 'other');

-- Конфигурация приложения (порог для хранения в БД)
CREATE TABLE IF NOT EXISTS app_config (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
INSERT INTO app_config (key, value) VALUES
  ('db_max_file_size_bytes', '52428800') -- 50 MB default
ON CONFLICT (key) DO NOTHING;

-- Пользователи
CREATE TABLE users (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email          TEXT NOT NULL UNIQUE,
  password_hash  TEXT NOT NULL,
  nickname       TEXT NOT NULL UNIQUE,
  about_info     TEXT,
  phone_number   TEXT UNIQUE,
  avatar_file_id UUID,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  verified       BOOLEAN NOT NULL DEFAULT false,
  verification_token TEXT
);
CREATE UNIQUE INDEX idx_users_email_unique ON users(email);
-- Файлы (hybrid backend = db / object_storage)
CREATE TABLE files (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id    UUID REFERENCES users(id) ON DELETE SET NULL,
  name        TEXT NOT NULL,
  mime_type   TEXT,
  backend     storage_backend NOT NULL DEFAULT 'object_storage',
  storage_bucket TEXT,
  storage_key TEXT,  -- для object_storage
  data        BYTEA, -- для backend='db'
  size_bytes  BIGINT NOT NULL DEFAULT 0,
  metadata    JSONB DEFAULT '{}'::jsonb,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Простая защита: одновременно data и storage_key недопустимы
ALTER TABLE files
  ADD CONSTRAINT chk_files_either_storage_or_data CHECK (
    NOT (data IS NOT NULL AND storage_key IS NOT NULL)
  );

-- Триггер: заполнение size_bytes и валидация backend/порога из app_config
CREATE OR REPLACE FUNCTION trg_files_validate_and_fill()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  db_limit BIGINT := 52428800;
  cfg_val TEXT;
  actual_size BIGINT;
BEGIN
  SELECT value INTO cfg_val FROM app_config WHERE key = 'db_max_file_size_bytes' LIMIT 1;
  IF FOUND THEN
    db_limit := cfg_val::BIGINT;
  END IF;

  IF NEW.data IS NOT NULL THEN
    actual_size := octet_length(NEW.data);
  ELSE
    actual_size := COALESCE(NEW.size_bytes, 0);
  END IF;
  NEW.size_bytes := actual_size;

  IF NEW.backend = 'db' THEN
    IF NEW.data IS NULL THEN
      RAISE EXCEPTION 'backend=db requires data (BYTEA)';
    END IF;
    IF NEW.storage_key IS NOT NULL THEN
      RAISE EXCEPTION 'backend=db must not have storage_key';
    END IF;
    IF NEW.size_bytes > db_limit THEN
      RAISE EXCEPTION 'file too large for DB backend (size=% / limit=% bytes)', NEW.size_bytes, db_limit;
    END IF;
  ELSIF NEW.backend = 'object_storage' THEN
    IF NEW.storage_key IS NULL OR NEW.storage_bucket IS NULL THEN
      RAISE EXCEPTION 'backend=object_storage requires storage_key';
    END IF;
    IF NEW.data IS NOT NULL THEN
      RAISE EXCEPTION 'backend=object_storage must not have data in DB';
    END IF;
  ELSE
    RAISE EXCEPTION 'unsupported backend: %', NEW.backend;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER files_before_insert_update
BEFORE INSERT OR UPDATE ON files
FOR EACH ROW EXECUTE FUNCTION trg_files_validate_and_fill();

-- Связь avatar_file_id -> files(id)
ALTER TABLE users
  ADD CONSTRAINT fk_users_avatar_file FOREIGN KEY (avatar_file_id) REFERENCES files(id) ON DELETE SET NULL;

-- Каналы и подписки
CREATE TABLE channels (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  owner_id   UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  pic_file_id UUID REFERENCES files(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_channels_owner ON channels(owner_id);

CREATE TABLE channel_subscriptions (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role       TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (channel_id, user_id)
);
CREATE INDEX idx_channel_subs_user ON channel_subscriptions(user_id);

-- Группы и участники
CREATE TABLE groups (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  owner_id   UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  pic_file_id UUID REFERENCES files(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE group_members (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id   UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role       TEXT,
  joined_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (group_id, user_id)
);

-- Дружба / запросы в друзья
CREATE TABLE friendships (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  addressee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status       friendship_status NOT NULL DEFAULT 'pending',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ,
  CONSTRAINT no_self_friend CHECK (requester_id <> addressee_id),
  UNIQUE (requester_id, addressee_id)
);
CREATE INDEX idx_friendships_requester ON friendships(requester_id);
CREATE INDEX idx_friendships_addressee ON friendships(addressee_id);

CREATE TABLE posts (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id           UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  -- владелец/контейнер поста:
  channel_id          UUID REFERENCES channels(id) ON DELETE CASCADE, -- если пост в канале
  -- target_user_id      UUID REFERENCES users(id) ON DELETE CASCADE,    -- если пост на личной странице пользователя
  text_f              TEXT NOT NULL,
  attachments_present BOOLEAN NOT NULL DEFAULT false,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  edited_at           TIMESTAMPTZ,
  deleted             BOOLEAN NOT NULL DEFAULT false,
  CONSTRAINT chk_posts_target_oneof CHECK (
    ((channel_id IS NOT NULL)::int + (author_id IS NOT NULL)::int) = 1
  )
);
-- Индексы для быстрого получения ленты: по каналу и по персональной странице
CREATE INDEX idx_posts_channel_created_at ON posts(channel_id, created_at DESC);
-- CREATE INDEX idx_posts_target_user_created_at ON posts(target_user_id, created_at DESC);
CREATE INDEX idx_posts_author_created_at ON posts(author_id, created_at DESC);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);

-- Вложения для постов
CREATE TABLE post_files (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id    UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  file_id    UUID NOT NULL REFERENCES files(id) ON DELETE CASCADE,
  ord        INT DEFAULT 0,
  attached_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (post_id, file_id)
);
CREATE INDEX idx_post_files_post ON post_files(post_id);

-- Комментарии (ветвящиеся)
CREATE TABLE comments (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id            UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  post_id              UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  text_f                 TEXT NOT NULL,
  answer_to_comment_id UUID, -- ссылка на комментарий того же поста
  has_attached_files   BOOLEAN NOT NULL DEFAULT false,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  edited_at            TIMESTAMPTZ,
  deleted              BOOLEAN NOT NULL DEFAULT false
);
CREATE INDEX idx_comments_post_created_at ON comments(post_id, created_at DESC);
CREATE INDEX idx_comments_sender ON comments(sender_id);

-- Триггер: проверяем, что answer_to_comment_id (если задан) принадлежит тому же post_id
CREATE OR REPLACE FUNCTION trg_comments_validate_parent()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  parent_post UUID;
BEGIN
  IF NEW.answer_to_comment_id IS NULL THEN
    RETURN NEW;
  END IF;
  SELECT post_id INTO parent_post FROM comments WHERE id = NEW.answer_to_comment_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'answer_to_comment_id % not found', NEW.answer_to_comment_id;
  END IF;
  IF parent_post <> NEW.post_id THEN
    RAISE EXCEPTION 'answer_to_comment_id must reference a comment of the same post';
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER comments_before_insert_update
BEFORE INSERT OR UPDATE ON comments
FOR EACH ROW EXECUTE FUNCTION trg_comments_validate_parent();

CREATE TABLE comment_files (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  file_id    UUID NOT NULL REFERENCES files(id) ON DELETE CASCADE,
  ord        INT DEFAULT 0,
  attached_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (comment_id, file_id)
);

-- Сообщения (peer messaging) — receiver: либо user, либо channel
CREATE TABLE messages (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_user_id    UUID REFERENCES users(id) ON DELETE CASCADE,
  receiver_channel_id UUID REFERENCES channels(id) ON DELETE CASCADE,
  text_f              TEXT NOT NULL,
  sent_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  edited_at           TIMESTAMPTZ,
  deleted             BOOLEAN NOT NULL DEFAULT false,
  CONSTRAINT chk_messages_one_receiver CHECK (
    ((receiver_user_id IS NOT NULL)::int + (receiver_channel_id IS NOT NULL)::int) = 1
  )
);
CREATE INDEX idx_messages_sender_sent_at ON messages(sender_id, sent_at DESC);
CREATE INDEX idx_messages_receiver_user_sent_at ON messages(receiver_user_id, sent_at DESC);
CREATE INDEX idx_messages_receiver_channel_sent_at ON messages(receiver_channel_id, sent_at DESC);

CREATE TABLE message_files (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  file_id    UUID NOT NULL REFERENCES files(id) ON DELETE CASCADE,
  ord        INT DEFAULT 0,
  attached_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (message_id, file_id)
);

-- Лайки (посты / комментарии)
CREATE TABLE likes (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target     like_target NOT NULL,
  post_id    UUID REFERENCES posts(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_like_target_consistency CHECK (
    (target = 'post' AND post_id IS NOT NULL AND comment_id IS NULL)
    OR
    (target = 'comment' AND comment_id IS NOT NULL AND post_id IS NULL)
  ),
  UNIQUE (user_id, target, post_id, comment_id)
);
CREATE INDEX idx_likes_user ON likes(user_id);
CREATE INDEX idx_likes_post ON likes(post_id);
CREATE INDEX idx_likes_comment ON likes(comment_id);

-- Полнотекстовые индексы
CREATE INDEX idx_posts_text_tsv ON posts USING gin (to_tsvector('english', coalesce(text_f, '')));
CREATE INDEX idx_comments_text_tsv ON comments USING gin (to_tsvector('english', coalesce(text_f, '')));

-- View: лента канала (показан как пример)
CREATE VIEW channel_feed AS
SELECT p.* FROM posts p
WHERE p.deleted = false
ORDER BY p.channel_id, p.created_at DESC;

-- ============================
-- "Избранное" (папки и элементы) — аналог Telegram folders + saved messages
-- ============================

-- Папки избранного у пользователя
CREATE TABLE favorites_folders (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title      TEXT NOT NULL,
  is_default BOOLEAN NOT NULL DEFAULT false, -- у пользователя может быть одна default-папка
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, title)
);
CREATE INDEX idx_fav_folders_user ON favorites_folders(user_id);

-- Элементы в папке избранного (polymorphic target: пост/комментарий/сообщение/файл/channel/user/other)
CREATE TABLE favorites_items (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  folder_id  UUID NOT NULL REFERENCES favorites_folders(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, -- владелец (редундантно удобно)
  target_type saved_target NOT NULL,
  target_id  UUID NOT NULL, -- id сущности в соответствующей таблице
  note       TEXT, -- пометка пользователя для сохранённого элемента
  ord        INT DEFAULT 0, -- порядок в папке
  saved_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_fav_per_folder_target UNIQUE (folder_id, target_type, target_id)
);
CREATE INDEX idx_fav_items_folder ON favorites_items(folder_id);
CREATE INDEX idx_fav_items_user ON favorites_items(user_id);

-- Триггер: проверка существования target (ограничивает консистентность "полиморфных" ссылок)
CREATE OR REPLACE FUNCTION trg_favorites_validate_target()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  cnt INT;
BEGIN
  IF NEW.target_type = 'post' THEN
    SELECT 1 INTO cnt FROM posts WHERE id = NEW.target_id LIMIT 1;
  ELSIF NEW.target_type = 'comment' THEN
    SELECT 1 INTO cnt FROM comments WHERE id = NEW.target_id LIMIT 1;
  ELSIF NEW.target_type = 'message' THEN
    SELECT 1 INTO cnt FROM messages WHERE id = NEW.target_id LIMIT 1;
  ELSIF NEW.target_type = 'file' THEN
    SELECT 1 INTO cnt FROM files WHERE id = NEW.target_id LIMIT 1;
  ELSIF NEW.target_type = 'channel' THEN
    SELECT 1 INTO cnt FROM channels WHERE id = NEW.target_id LIMIT 1;
  ELSIF NEW.target_type = 'user' THEN
    SELECT 1 INTO cnt FROM users WHERE id = NEW.target_id LIMIT 1;
  ELSE
    cnt := 1; -- для 'other' не проверяем
  END IF;

  IF NOT FOUND OR cnt IS NULL THEN
    RAISE EXCEPTION 'favorites_items: target % with id % not found', NEW.target_type, NEW.target_id;
  END IF;

  -- Пользователь должен быть владельцем папки (дополнительная проверка)
  PERFORM 1 FROM favorites_folders f WHERE f.id = NEW.folder_id AND f.user_id = NEW.user_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'favorites_items: folder % does not belong to user %', NEW.folder_id, NEW.user_id;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER favorites_items_before_insert_update
BEFORE INSERT OR UPDATE ON favorites_items
FOR EACH ROW EXECUTE FUNCTION trg_favorites_validate_target();

-- ============================
-- Доп. индексы и мелкие утилиты
-- ============================
CREATE INDEX idx_files_owner ON files(owner_id);
CREATE INDEX idx_files_created_at ON files(created_at DESC);
CREATE INDEX idx_files_metadata ON files USING gin (metadata);

-- ============================
-- Конец скрипта
-- ============================
