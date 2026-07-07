# Car Rental App - Setup Guide

## Prerequisites

- Node.js (v14 or higher)
- MySQL Server (v5.7 or higher)
- npm

## Initial Setup

### 1. Create the Database and Tables

Copy and run this in your MySQL client or MySQL Workbench:

```sql
CREATE DATABASE IF NOT EXISTS car_rental CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE car_rental;

CREATE TABLE IF NOT EXISTS users (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  phone VARCHAR(50) DEFAULT NULL,
  role ENUM('user','admin') NOT NULL DEFAULT 'user',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS cars (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  image VARCHAR(1024) DEFAULT NULL,
  category JSON DEFAULT JSON_ARRAY(),
  features JSON DEFAULT JSON_ARRAY(),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS bookings (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  car_id INT UNSIGNED NOT NULL,
  user_id INT UNSIGNED DEFAULT NULL,
  customer_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50) DEFAULT NULL,
  pickup_date DATE NOT NULL,
  return_date DATE NOT NULL,
  days INT UNSIGNED NOT NULL DEFAULT 1,
  total_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  payment_method VARCHAR(100) NOT NULL DEFAULT 'card',
  is_paid TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_bookings_car_id (car_id),
  KEY idx_bookings_user_id (user_id),
  CONSTRAINT fk_bookings_car FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE CASCADE,
  CONSTRAINT fk_bookings_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS feedback (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id INT UNSIGNED DEFAULT NULL,
  user_name VARCHAR(255) NOT NULL,
  user_email VARCHAR(255) DEFAULT NULL,
  rating TINYINT UNSIGNED NOT NULL DEFAULT 5,
  comment TEXT NOT NULL,
  car_id INT UNSIGNED DEFAULT NULL,
  is_featured TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_feedback_car_id (car_id),
  KEY idx_feedback_user_id (user_id),
  CONSTRAINT fk_feedback_car FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE SET NULL,
  CONSTRAINT fk_feedback_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS admins (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id INT UNSIGNED NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uniq_admin_user (user_id),
  CONSTRAINT fk_admins_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Insert sample admin user (password: admin123)
INSERT INTO users (name, email, password_hash, phone, role) VALUES
('Admin User', 'admin@example.com', '$2a$10$YourHashedPasswordHere', '1234567890', 'admin');

-- Insert sample cars
INSERT INTO cars (name, description, price, image, category, features) VALUES
('Toyota Camry', 'Comfortable sedan for daily commute', 50.00, 'https://via.placeholder.com/400x300?text=Toyota+Camry', '["Business"]', '["AC", "Power Steering", "Auto Transmission"]'),
('Honda Civic', 'Compact and fuel-efficient car', 45.00, 'https://via.placeholder.com/400x300?text=Honda+Civic', '["Business", "Family"]', '["AC", "Power Steering"]'),
('SUV Explorer', 'Spacious SUV perfect for families', 80.00, 'https://via.placeholder.com/400x300?text=SUV+Explorer', '["Family", "Adventure"]', '["AC", "7 Seater", "Sunroof", "All-Terrain Tires"]');
```

### 2. Configure Backend Environment

Create/edit `backend/.env`:

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=car_rental
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
CLIENT_URL=http://localhost:5173
PORT=3000
```

### 3. Install Dependencies

```bash
npm install-all
```

### 4. Start the Application

```bash
npm run dev
```

This will start:

- **Backend**: http://localhost:3000
- **Frontend**: http://localhost:5173

### 5. Test Login

**User Account:**

- Email: `user@example.com`
- Password: `password123`

Create a test user by registering on the /login page.

**Admin Account:**

- Email: `admin@example.com`
- Password: `admin123`

(To enable admin account, manually update user's role to 'admin' in database)

## Troubleshooting

### "Internal Server Error" on Login

- Check if MySQL is running
- Verify database and tables are created
- Check backend `.env` configuration
- Look for error logs in terminal where backend is running

### Frontend Cannot Connect to Backend

- Ensure backend is running on port 3000
- Check CORS settings in `backend/server.js`
- Verify `vite.config.js` proxy is configured correctly

### MySQL Connection Failed

- Verify MySQL service is running
- Check credentials in `backend/.env`
- Ensure `car_rental` database exists
