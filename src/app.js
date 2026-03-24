const express = require('express');
const Database = require("better-sqlite3");
const path = require('path');

const app = express();
const port = 3000;

// Database setup
const db = new Database("database.db");

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    password TEXT NOT NULL
  )
`);

// Week 3 - Creating a products table for search requests
db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL
  )
`);

// Seeding a test user with plain text password and no hashing
const existing = db.prepare("SELECT * FROM users WHERE username = 'admin'").get();
if (!existing) {
  db.prepare("INSERT INTO users (username, password) VALUES (?, ?)").run("admin", "password123");
  db.prepare("INSERT INTO users (username, password) VALUES (?, ?)").run("alice", "alice123");
  db.prepare("INSERT INTO users (username, password) VALUES (?, ?)").run("bob", "bob123");
}

// Seeding products into the products table
const existingProduct = db.prepare("SELECT * FROM products WHERE name = 'Hammer'").get();
if (!existingProduct) {
  db.prepare("INSERT INTO products (name) VALUES (?)").run("Hammer");
  db.prepare("INSERT INTO products (name) VALUES (?)").run("Screwdriver");
  db.prepare("INSERT INTO products (name) VALUES (?)").run("Wrench");
}

// App (server) handles incoming GET requests to the root URL (/)
// (The browser sends requests)
app.get('/', (req, res) => {
  res.send('<h1>HackShield<h1>');
});

// Lets express read form data
app.use(express.urlencoded({extended:true}));

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, "views", "login.html"));
});

// The browser sends inputted form data to the server through a POST request
app.post('/login', (req, res) => {
    const {username, password} = req.body;
    
    // INSECURE: String interpolation makes this vulnerable to SQL injection
  const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
  console.log(`[DEBUG] Query: ${query}`); // INSECURE: exposes internals in logs

  let message;
  try {
    const user = db.prepare(query).get();
    if (user) {
      // INSECURE: No session created — authentication doesn't persist
      message = `Welcome, ${username}!`;
    } else {
      message = "Login failed.";
    }
  } catch (err) {
    // INSECURE: Raw error sent to user — leaks database internals
    message = `Database error: ${err.message}`;
  }

  res.send(`
    <h2>${message}</h2>
    <a href="/login">Try again</a>
  `);
});

// App starts a server and listens on port 3000 for connections
// It responds with HTML for requests to the root URL (/) 
// For every other path it responds with 404 Not Found (EXPRESS' framework does this behind the scenes)
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
