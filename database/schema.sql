-- Destinify database schema
-- Run against the `destinify` database (utf8mb4)

CREATE DATABASE IF NOT EXISTS destinify CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE destinify;

-- Users and roles (admin / traveler)
CREATE TABLE users (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin','traveler') NOT NULL DEFAULT 'traveler',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Destination types (beach, mountain, island, city, historical, ...)
CREATE TABLE categories (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(80) NOT NULL UNIQUE
) ENGINE=InnoDB;

-- Activities (snorkeling, hiking, surfing, ...)
CREATE TABLE activities (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(80) NOT NULL UNIQUE
) ENGINE=InnoDB;

-- Interests (nature, food, culture, adventure, ...)
CREATE TABLE interests (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(80) NOT NULL UNIQUE
) ENGINE=InnoDB;

-- Destinations
CREATE TABLE destinations (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  description TEXT,
  category_id INT UNSIGNED NOT NULL,
  region VARCHAR(80) NOT NULL,
  province VARCHAR(80),
  estimated_budget DECIMAL(10,2) NOT NULL,      -- PHP per person for the trip
  recommended_days TINYINT UNSIGNED NOT NULL,
  latitude DECIMAL(9,6),
  longitude DECIMAL(9,6),
  image_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id)
) ENGINE=InnoDB;

CREATE TABLE destination_activities (
  destination_id INT UNSIGNED NOT NULL,
  activity_id INT UNSIGNED NOT NULL,
  PRIMARY KEY (destination_id, activity_id),
  FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE CASCADE,
  FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE destination_interests (
  destination_id INT UNSIGNED NOT NULL,
  interest_id INT UNSIGNED NOT NULL,
  PRIMARY KEY (destination_id, interest_id),
  FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE CASCADE,
  FOREIGN KEY (interest_id) REFERENCES interests(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- A traveler's saved preferences
CREATE TABLE user_preferences (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  max_budget DECIMAL(10,2),
  category_id INT UNSIGNED,
  region VARCHAR(80),
  trip_days TINYINT UNSIGNED,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE preference_activities (
  preference_id INT UNSIGNED NOT NULL,
  activity_id INT UNSIGNED NOT NULL,
  PRIMARY KEY (preference_id, activity_id),
  FOREIGN KEY (preference_id) REFERENCES user_preferences(id) ON DELETE CASCADE,
  FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE preference_interests (
  preference_id INT UNSIGNED NOT NULL,
  interest_id INT UNSIGNED NOT NULL,
  PRIMARY KEY (preference_id, interest_id),
  FOREIGN KEY (preference_id) REFERENCES user_preferences(id) ON DELETE CASCADE,
  FOREIGN KEY (interest_id) REFERENCES interests(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Saved favorites
CREATE TABLE favorites (
  user_id INT UNSIGNED NOT NULL,
  destination_id INT UNSIGNED NOT NULL,
  saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, destination_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Recommendation history (for reports and dashboard)
CREATE TABLE recommendations (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  destination_id INT UNSIGNED NOT NULL,
  match_score DECIMAL(5,2) NOT NULL,            -- 0 to 100
  generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Starter lookup data
INSERT INTO categories (name) VALUES
  ('Beach'), ('Island'), ('Mountain'), ('City'), ('Historical'), ('Nature'), ('Waterfall');

INSERT INTO activities (name) VALUES
  ('Swimming'), ('Snorkeling'), ('Diving'), ('Hiking'), ('Surfing'), ('Island hopping'), ('Sightseeing'), ('Camping');

INSERT INTO interests (name) VALUES
  ('Nature'), ('Adventure'), ('Culture'), ('Food'), ('Relaxation'), ('History'), ('Photography');
