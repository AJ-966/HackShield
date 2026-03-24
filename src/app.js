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

// Week 3 - Creating comments table for comment box feature
db.exec(`
  CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content TEXT NOT NULL
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
// Week 3 - OWASP A03 - Injection - SQL injection is possible through string interpolation
// Example: The user name ' OR '1'='1'-- bypasses the authentication and would login the user with any password
app.post('/login', (req, res) => {
    const {username, password} = req.body;
    
    // INSECURE: String interpolation makes this vulnerable to SQL injection
    // VULNERABLE — SQL Injection possible here (Week 3 Step 2 already implemented in Week 2)
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
    <a href="/login">Try again</a> | <a href="/">Home</a>
  `);
});


// Week 3 Step 1 - Search Page
// OWASP A03 - Injection (User input is directly used in SQL query)
// Potential SQL attack: Searching ' OR '1'='1'-- returns the entire product list
app.get("/search", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "search.html"));
});

app.get("/search/results", (req, res) => {
  // raw user input is never sanitized and is used as a query
  const query = req.query.q; 

  // VULNERABLE — SQL Injection possible here - 
  // `` are string literals that allow the contents of ${} to embed variables directly into strings
  // Therefore user input is put directly into the query string without any checks to sanitise it
  const sql = `SELECT * FROM products WHERE name = '${query}'`;
  console.log(`[DEBUG] Search query: ${sql}`);

  let results = [];
  let error = null;

  try {
    results = db.prepare(sql).all();
  } catch (err) {
    // INSECURE: Raw database error is shown to user
    error = `Database error: ${err.message}`;
  }

  res.send(`
    <!DOCTYPE html>
    <html>
    <head><title>Search Results</title></head>
    <body>
      <h2>Search Results for: ${query}</h2>
      ${error ? `<p style="color:red">${error}</p>` : ""}
      ${results.length > 0
        ? results.map(r => `<p>${r.id}: ${r.name}</p>`).join("")
        : "<p>No results found.</p>"
      }
      <a href="/search">Search again</a> | <a href="/">Home</a>
    </body>
    </html>
  `);
});

// Week 3 Step 2 - Profile page
// OWASP A03 Injection - user input is directly queried from the users database
// Potential SQL attack: Inputting /profile?id=1 or any exisiting id number in the URL bar returns all of that user's data without any validation
// Therefore, any user data is accessible without proper validation
app.get("/profile", (req, res) => {
  // raw URL parameter is never sanitised and used as a query
  const id = req.query.id; 

  // VULNERABLE — SQL Injection possible here
  const sql = `SELECT * FROM users WHERE id = ${id}`;
  console.log(`[DEBUG] Profile query: ${sql}`);

  let user = null;
  let error = null;

  try {
    user = db.prepare(sql).get();
  } catch (err) {
    // INSECURE: Raw database error shown to user
    error = `Database error: ${err.message}`;
  }

  res.send(`
    <!DOCTYPE html>
    <html>
    <head><title>User Profile</title></head>
    <body>
      <h2>User Profile</h2>
      ${error ? `<p style="color:red">${error}</p>` : ""}
      ${user
        ? `<p>ID: ${user.id}</p>
           <p>Username: ${user.username}</p>
           <p>Password: ${user.password}</p>`  
        : "<p>User not found.</p>"
      }
      <a href="/">Home</a>
    </body>
    </html>
  `);
});

// Week 3 Step 3 - Comment Box
// User input is stored and displayed without HTML escaping
// Potential for XSS injection since scripts can be executed in <>
// OWASP A03 - Injection 
// Potential XSS attack: Submitting <script>alert('hacked')</script> executes in browser
app.get("/comments", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "comments.html"));
});

app.post("/comments", (req, res) => {
  const { content } = req.body;

  // VULNERABLE: Raw user input stored directly — no sanitization
  db.prepare("INSERT INTO comments (content) VALUES (?)").run(content);

  // Fetch all comments
  const comments = db.prepare("SELECT * FROM comments").all();

  res.send(`
    <!DOCTYPE html>
    <html>
    <head><title>Comments</title></head>
    <body>
      <h2>Comments</h2>
      ${comments.map(c => `
        <div>
          <!-- VULNERABLE: content rendered as raw HTML — enables XSS -->
          <p>${c.content}</p>
        </div>
      `).join("")}
      <a href="/comments">Add another</a> | <a href="/">Home</a>
    </body>
    </html>
  `);
});


// App starts a server and listens on port 3000 for connections
// It responds with HTML for requests to the root URL (/) 
// For every other path it responds with 404 Not Found (EXPRESS' framework does this behind the scenes)
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
