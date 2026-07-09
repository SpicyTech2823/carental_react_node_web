# 🚗 Car Rental Web Application

A full-stack **Car Rental Web Application** built with **React.js**, **Tailwind CSS**, **Node.js**, **Express.js**, and **MySQL**. The platform allows customers to browse available cars, make rental bookings, and manage their accounts, while administrators can manage vehicles, bookings, and users through a dedicated admin dashboard.

---

## 📌 Features

### 👤 User Features

* User registration and login
* Secure authentication
* Browse available rental cars
* Search and filter vehicles
* View detailed car information
* Rent or book a car
* View rental history
* Responsive design for desktop and mobile

### 🔐 Admin Features

* Admin authentication
* Dashboard overview
* Manage vehicles (Add, Edit, Delete)
* Manage users
* Manage rental bookings
* Update booking status
* View rental statistics

---

## 🛠️ Tech Stack

### Frontend

* React.js
* Tailwind CSS
* React Router
* Axios

### Backend

* Node.js
* Express.js

### Database

* MySQL

### Authentication

* JWT (JSON Web Token)
* bcrypt

---

## 📂 Project Structure

```text
car-rental-web/
│
├── client/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── layouts/
│   │   ├── services/
│   │   ├── context/
│   │   ├── hooks/
│   │   └── App.jsx
│   └── package.json
│
├── server/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── uploads/
│   ├── server.js
│   └── package.json
│
├── database/
│   └── car_rental.sql
│
└── README.md
```

---

## ⚙️ Installation

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/car-rental-web.git
cd car-rental-web
```

### 2. Install Frontend Dependencies

```bash
cd client
npm install
```

### 3. Install Backend Dependencies

```bash
cd ../server
npm install
```

---

## 🗄️ Database Setup

1. Create a MySQL database.

```sql
CREATE DATABASE car_rental;
```

2. Import the SQL file.

```text
database/car_rental.sql
```

3. Configure your database credentials in the backend `.env` file.

Example:

```env
PORT=5000

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=car_rental

JWT_SECRET=your_secret_key
```

---

## ▶️ Running the Project

### Start Backend

```bash
cd server
npm run dev
```

### Start Frontend

```bash
cd client
npm run dev
```

Open your browser:

```
http://localhost:5173
```

---

## 📸 Screenshots

You can add screenshots here.

* Home Page
* Car Listing
* Car Details
* Booking Page
* Admin Dashboard

---

## 🔮 Future Improvements

* Online payment integration
* Email notifications
* Car availability calendar
* Wishlist feature
* Advanced analytics dashboard
* Multi-language support

---

## 👨‍💻 Author

**Sakirin Sles**

* GitHub: https://github.com/SpicyTech2823

---

## 📄 License

This project is created for educational and portfolio purposes.
