DROP DATABASE IF EXISTS yatrik;
CREATE DATABASE yatrik;
USE yatrik;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    display_name VARCHAR(50),
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE destinations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    region VARCHAR(100),
    description TEXT,
    image_url VARCHAR(500),
    best_time VARCHAR(200),
    recommended_days INT DEFAULT 3,
    daily_budget_estimate INT,
    travel_notes TEXT,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE attractions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    destination_id INT NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    duration VARCHAR(50),
    entry_fee DECIMAL(10,2) DEFAULT 0,
    location VARCHAR(200),
    recommended_time VARCHAR(100),
    image_url VARCHAR(500),
    tips TEXT,
    FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE CASCADE,
    INDEX (destination_id)
) ENGINE=InnoDB;

CREATE TABLE foods (
    id INT AUTO_INCREMENT PRIMARY KEY,
    destination_id INT NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    price DECIMAL(10,2),
    dietary_type ENUM('Vegetarian','Non-Vegetarian','Vegan','Egg') DEFAULT 'Vegetarian',
    where_to_find VARCHAR(300),
    image_url VARCHAR(500),
    FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE CASCADE,
    INDEX (destination_id)
) ENGINE=InnoDB;

CREATE TABLE restaurants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    destination_id INT NOT NULL,
    name VARCHAR(200) NOT NULL,
    location VARCHAR(300),
    cuisine VARCHAR(200),
    specialty VARCHAR(300),
    price_range ENUM('Budget','Mid-Range','Premium','Luxury') DEFAULT 'Mid-Range',
    description TEXT,
    rating DECIMAL(2,1),
    image_url VARCHAR(500),
    FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE CASCADE,
    INDEX (destination_id)
) ENGINE=InnoDB;

CREATE TABLE souvenirs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    destination_id INT NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    price DECIMAL(10,2),
    purchase_location VARCHAR(300),
    cultural_significance TEXT,
    image_url VARCHAR(500),
    FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE CASCADE,
    INDEX (destination_id)
) ENGINE=InnoDB;

CREATE TABLE transport_options (
    id INT AUTO_INCREMENT PRIMARY KEY,
    from_destination VARCHAR(100),
    to_destination VARCHAR(100),
    destination_id INT,
    transport_type ENUM('Flight','Train','Bus','Cab') NOT NULL,
    provider VARCHAR(200) NOT NULL,
    departure VARCHAR(20),
    arrival VARCHAR(20),
    duration VARCHAR(50),
    estimated_price DECIMAL(10,2),
    class_type VARCHAR(100),
    vehicle_type VARCHAR(100),
    capacity INT,
    status VARCHAR(50) DEFAULT 'Available',
    FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE SET NULL,
    INDEX (destination_id, transport_type)
) ENGINE=InnoDB;

CREATE TABLE trips (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    destination_id INT NOT NULL,
    start_location VARCHAR(200),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    travelers INT NOT NULL DEFAULT 1,
    budget DECIMAL(12,2) NOT NULL,
    travel_mode VARCHAR(50),
    accommodation_pref VARCHAR(100),
    food_pref VARCHAR(100),
    trip_style VARCHAR(100),
    planning_mode ENUM('Manual','AI') DEFAULT 'Manual',
    status ENUM('Draft','Planned','Completed') DEFAULT 'Draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE CASCADE,
    INDEX (user_id, destination_id)
) ENGINE=InnoDB;

CREATE TABLE itinerary_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    trip_id INT NOT NULL,
    day_number INT NOT NULL,
    time_slot ENUM('Morning','Afternoon','Evening','Night'),
    activity_type VARCHAR(50),
    attraction_id INT,
    food_id INT,
    restaurant_id INT,
    estimated_cost DECIMAL(10,2) DEFAULT 0,
    notes TEXT,
    FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
    FOREIGN KEY (attraction_id) REFERENCES attractions(id) ON DELETE SET NULL,
    FOREIGN KEY (food_id) REFERENCES foods(id) ON DELETE SET NULL,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE SET NULL,
    INDEX (trip_id)
) ENGINE=InnoDB;

CREATE TABLE favorites (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    item_type ENUM('destination','attraction','food','restaurant','souvenir') NOT NULL,
    item_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY (user_id, item_type, item_id)
) ENGINE=InnoDB;

CREATE TABLE system_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    action VARCHAR(200) NOT NULL,
    details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX (user_id)
) ENGINE=InnoDB;
