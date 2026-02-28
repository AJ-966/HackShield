const express = require('express');
const app = express();
const port = 3000;

// App (server) handles incoming GET requests to the root URL (/)
// (The browser sends requests)
app.get('/', (req, res) => {
  res.send('<h1>HackShield<h1>');
});

const path = require('path');
// Lets express read form data
app.use(express.urlencoded({extended:true}));

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, "views", "login.html"));
});

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
