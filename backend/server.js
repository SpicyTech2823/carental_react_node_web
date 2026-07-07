require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2/promise');

const app = express();
const port = process.env.PORT || 3000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
const JWT_SECRET = process.env.JWT_SECRET || 'change-this-secret';

app.use(cors({ origin: CLIENT_URL, credentials: true }));
app.use(express.json());

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'car_rental',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  decimalNumbers: true,
  namedPlaceholders: true,
  typeCast: (field, next) => {
    if (field.type === 'JSON') {
      const value = field.string();
      return value ? JSON.parse(value) : null;
    }
    return next();
  }
});

const sendError = (res, status, message) => res.status(status).json({ error: message });

const createToken = (user) => jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

const getAuthToken = (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.slice(7);
};

const authMiddleware = (req, res, next) => {
  const token = getAuthToken(req);
  if (!token) {
    return sendError(res, 401, 'Authorization token required');
  }

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (err) {
    return sendError(res, 401, 'Invalid or expired token');
  }
};

const adminMiddleware = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return sendError(res, 403, 'Admin access required');
  }
  next();
};

const normalizeArray = (value) => {
  if (Array.isArray(value)) return value.filter((item) => item && item.toString().trim());
  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
};

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password) {
      return sendError(res, 400, 'Name, email, and password are required');
    }

    const normalizedEmail = email.toLowerCase().trim();
    const [existingUsers] = await pool.query('SELECT id FROM users WHERE email = ?', [normalizedEmail]);
    if (existingUsers.length > 0) {
      return sendError(res, 409, 'Email already registered');
    }

    const passwordHash = bcrypt.hashSync(password, 10);
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password_hash, phone, role) VALUES (?, ?, ?, ?, ?)',
      [name.trim(), normalizedEmail, passwordHash, phone || '', 'user']
    );

    const user = {
      id: result.insertId,
      name: name.trim(),
      email: normalizedEmail,
      phone: phone || '',
      role: 'user'
    };

    return res.json({ token: createToken(user), user });
  } catch (err) {
    console.error('Register error:', err);
    return sendError(res, 500, 'Unable to register. Please check the server database connection.');
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return sendError(res, 400, 'Email and password are required');
    }

    const normalizedEmail = email.toLowerCase().trim();
    const [rows] = await pool.query('SELECT id, name, email, phone, role, password_hash FROM users WHERE email = ?', [normalizedEmail]);
    const user = rows[0];

    if (!user || !bcrypt.compareSync(password, user.password_hash)) {
      return sendError(res, 401, 'Email or password is incorrect');
    }

    return res.json({
      token: createToken(user),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    return sendError(res, 500, 'Unable to sign in. Please check the server database connection.');
  }
});

app.get('/api/auth/profile', authMiddleware, async (req, res) => {
  const [rows] = await pool.query('SELECT id, name, email, phone, role, created_at FROM users WHERE id = ?', [req.user.id]);
  const user = rows[0];
  if (!user) {
    return sendError(res, 404, 'User not found');
  }
  return res.json({ user });
});

app.post('/api/auth/reset-password', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return sendError(res, 400, 'Email and new password are required');
  }

  const normalizedEmail = email.toLowerCase().trim();
  const [rows] = await pool.query('SELECT id FROM users WHERE email = ?', [normalizedEmail]);
  const user = rows[0];
  if (!user) {
    return sendError(res, 404, 'No account found for that email');
  }

  const passwordHash = bcrypt.hashSync(password, 10);
  await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [passwordHash, user.id]);
  return res.json({ message: 'Password has been updated successfully' });
});

app.get('/api/cars', async (req, res) => {
  const [rows] = await pool.query('SELECT id, name, description, price, image, category, features FROM cars ORDER BY id');
  return res.json({ cars: rows.map((car) => ({
    ...car, // spread the car object to include all its properties
    category: typeof car.category === 'string' ? JSON.parse(car.category || '[]') : car.category || [],
    features: typeof car.features === 'string' ? JSON.parse(car.features || '[]') : car.features || []
  })) });
});

app.post('/api/cars', authMiddleware, adminMiddleware, async (req, res) => {
  const { name, description, price, image, category, features } = req.body;
  if (!name || !description || !price) {
    return sendError(res, 400, 'Name, description, and price are required');
  }

  const categories = normalizeArray(category);
  const featuresArray = normalizeArray(features);
  const [result] = await pool.query(
    'INSERT INTO cars (name, description, price, image, category, features) VALUES (?, ?, ?, ?, ?, ?)',
    [name.trim(), description.trim(), parseFloat(price), image || '', JSON.stringify(categories), JSON.stringify(featuresArray)]
  );

  return res.json({ car: { id: result.insertId, name: name.trim(), description: description.trim(), price: parseFloat(price), image: image || '', category: categories, features: featuresArray } });
});

app.put('/api/cars/:id', authMiddleware, adminMiddleware, async (req, res) => {
  const { id } = req.params;
  const { name, description, price, image, category, features } = req.body;
  const categories = normalizeArray(category);
  const featuresArray = normalizeArray(features);
  await pool.query(
    'UPDATE cars SET name = ?, description = ?, price = ?, image = ?, category = ?, features = ? WHERE id = ?',
    [name.trim(), description.trim(), parseFloat(price), image || '', JSON.stringify(categories), JSON.stringify(featuresArray), id]
  );
  return res.json({ message: 'Car updated successfully' });
});

app.delete('/api/cars/:id', authMiddleware, adminMiddleware, async (req, res) => {
  await pool.query('DELETE FROM cars WHERE id = ?', [req.params.id]);
  return res.json({ message: 'Car deleted successfully' });
});

app.get('/api/bookings', authMiddleware, adminMiddleware, async (req, res) => {
  const [rows] = await pool.query(
    `SELECT b.id, b.car_id, b.user_id, b.customer_name, b.email, b.phone, b.pickup_date, b.return_date, b.days, b.total_price, b.payment_method, b.is_paid, b.created_at, c.name AS car_name, c.image AS car_image
     FROM bookings b
     LEFT JOIN cars c ON b.car_id = c.id
     ORDER BY b.created_at DESC`
  );
  return res.json({ bookings: rows });
});

app.post('/api/bookings', async (req, res) => {
  const { car_id, customer_name, email, phone, pickup_date, return_date, days, total_price, payment_method, is_paid } = req.body;
  if (!car_id || !customer_name || !email || !pickup_date || !return_date) {
    return sendError(res, 400, 'Booking must include car, name, email, pickup date, and return date');
  }

  const token = getAuthToken(req);
  let userId = null;
  if (token) {
    try {
      userId = jwt.verify(token, JWT_SECRET).id;
    } catch (err) {
      userId = null;
    }
  }

  await pool.query(
    'INSERT INTO bookings (car_id, user_id, customer_name, email, phone, pickup_date, return_date, days, total_price, payment_method, is_paid) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [car_id, userId, customer_name.trim(), email.trim(), phone || '', pickup_date, return_date, parseInt(days || 1, 10), parseFloat(total_price || 0), payment_method || 'card', is_paid ? 1 : 0]
  );

  return res.json({ message: 'Booking created successfully' });
});

app.put('/api/bookings/:id', authMiddleware, adminMiddleware, async (req, res) => {
  const { id } = req.params;
  const { is_paid } = req.body;
  await pool.query('UPDATE bookings SET is_paid = ? WHERE id = ?', [is_paid ? 1 : 0, id]);
  return res.json({ message: 'Booking updated successfully' });
});

app.delete('/api/bookings/:id', authMiddleware, adminMiddleware, async (req, res) => {
  await pool.query('DELETE FROM bookings WHERE id = ?', [req.params.id]);
  return res.json({ message: 'Booking deleted successfully' });
});

app.get('/api/feedback', async (req, res) => {
  const featured = req.query.featured === 'true';
  const [rows] = await pool.query(
    `SELECT f.id, f.user_id, f.user_name, f.user_email, f.rating, f.comment, f.car_id, f.is_featured, f.created_at, c.name AS car_name
     FROM feedback f
     LEFT JOIN cars c ON f.car_id = c.id
     ${featured ? 'WHERE f.is_featured = 1' : ''}
     ORDER BY f.created_at DESC`
  );
  return res.json({ feedback: rows });
});

app.post('/api/feedback', async (req, res) => {
  const { user_name, rating, comment, car_id, user_email } = req.body;
  if (!user_name || !rating || !comment) {
    return sendError(res, 400, 'Name, rating, and comment are required');
  }

  const token = getAuthToken(req);
  let userId = null;
  if (token) {
    try {
      userId = jwt.verify(token, JWT_SECRET).id;
    } catch (err) {
      userId = null;
    }
  }

  await pool.query(
    'INSERT INTO feedback (user_id, user_name, user_email, rating, comment, car_id, is_featured) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [userId, user_name.trim(), user_email || '', parseInt(rating, 10), comment.trim(), car_id || null, 0]
  );
  return res.json({ message: 'Feedback submitted successfully' });
});

app.put('/api/feedback/:id', authMiddleware, adminMiddleware, async (req, res) => {
  const { id } = req.params;
  const { is_featured } = req.body;
  await pool.query('UPDATE feedback SET is_featured = ? WHERE id = ?', [is_featured ? 1 : 0, id]);
  return res.json({ message: 'Feedback updated successfully' });
});

app.delete('/api/feedback/:id', authMiddleware, adminMiddleware, async (req, res) => {
  await pool.query('DELETE FROM feedback WHERE id = ?', [req.params.id]);
  return res.json({ message: 'Feedback deleted successfully' });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
