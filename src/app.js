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

// Seeding a test user with plain text password and no hashing
const existing = db.prepare("SELECT * FROM users WHERE username = 'admin'").get();
if (!existing) {
  db.prepare("INSERT INTO users (username, password) VALUES (?, ?)").run("admin", "password123");
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
    res.send('Received: ${username} / ${password}');
})

// App starts a server and listens on port 3000 for connections
// It responds with HTML for requests to the root URL (/) 
// For every other path it responds with 404 Not Found (EXPRESS' framework does this behind the scenes)
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
