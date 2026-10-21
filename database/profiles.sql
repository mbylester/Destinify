-- Extra profile details (photo, contact, preferences). The API also creates this table automatically,
-- so running this file is optional. Safe to run more than once.
USE destinify_app;
CREATE TABLE IF NOT EXISTS user_profiles (
  user_id INT UNSIGNED NOT NULL PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL DEFAULT '',
  email VARCHAR(150) NOT NULL DEFAULT '',
  phone VARCHAR(30) NOT NULL DEFAULT '',
  home_city VARCHAR(80) NOT NULL DEFAULT '',
  bio VARCHAR(200) NOT NULL DEFAULT '',
  budget INT UNSIGNED NOT NULL DEFAULT 8000,
  fav_types VARCHAR(300) NOT NULL DEFAULT '',
  avatar MEDIUMTEXT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_profile_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
