const express = require('express');
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const path = require('path');

// --- ПРИЛОЖЕНИЕ ---
const app = express();
const PORT = 3000;

// --- MIDDLEWARE ---
// cors() разрешает фронтенду (порт 80/5500) обращаться к серверу (порт 3000)
app.use(cors());
// express.json() парсит тело запроса из JSON в объект JS
app.use(express.json());
// Отдаём статические файлы (HTML, CSS, JS) из текущей папки
app.use(express.static(path.join(__dirname)));

// --- БАЗА ДАННЫХ ---
// Создаём файл users.db (или открываем если уже есть)
const db = new Database('users.db');

// Создаём таблицу users если её нет
// INTEGER PRIMARY KEY AUTOINCREMENT — id генерируется автоматически
// UNIQUE на email — нельзя зарегистрироваться дважды с одним email
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  )
`);

// --- ЭНДПОИНТЫ ---

// POST /api/register — регистрация нового пользователя
app.post('/api/register', (req, res) => {
  const { name, email, password } = req.body;

  // Проверяем что все поля заполнены
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  // Проверяем минимальную длину пароля
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  // Хешируем пароль — bcrypt добавляет "соль" (случайные символы)
  // Число 10 — "стоимость" хеширования (чем больше, тем дольше брутфорс)
  const hashedPassword = bcrypt.hashSync(password, 10);

  try {
    // Вставляем пользователя в базу
    const stmt = db.prepare('INSERT INTO users (name, email, password) VALUES (?, ?, ?)');
    const result = stmt.run(name, email, hashedPassword);

    res.status(201).json({
      message: 'User registered successfully',
      userId: result.lastInsertRowid
    });
  } catch (err) {
    // Если email уже занят — SQLite вернёт ошибку UNIQUE constraint
    if (err.message.includes('UNIQUE constraint failed')) {
      return res.status(409).json({ error: 'Email already registered' });
    }
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/login — вход существующего пользователя
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  // Ищем пользователя по email
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

  // Не говорим "пользователь не найден" — это утечка информации
  // Говорим общее "неверные данные"
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  // Сравниваем введённый пароль с хешем из базы
  const passwordMatch = bcrypt.compareSync(password, user.password);

  if (!passwordMatch) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  res.json({
    message: 'Login successful',
    user: { id: user.id, name: user.name, email: user.email }
  });
});

// GET /api/users — смотрим всех пользователей (только для разработки!)
app.get('/api/users', (req, res) => {
  const users = db.prepare('SELECT id, name, email, created_at FROM users').all();
  res.json(users);
});

// --- ЗАПУСК ---
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Open: http://localhost:${PORT}/Mysite1.html`);
});
