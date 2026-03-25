# HackShield

## Project Overview
HackShield is an offensive security application that will be intentionally vulnerable. The user will be able to monitor and identify vulnerabilities, exploit them safely to simulate a real attacker's actions, and fix them. The goal is to understand and simulate both the offensive and defensive side of real attacks. 

## Features
### Implemented Features
- Simple web application server
- Database that stores credentials in plain text
- Weak authentication logic
- Search page that searches products without sanitisation
- Comment box without HTML escaping
- User profile search through URL

## Tech Stack
### Languages
- Node.js - to implement the application's backend

### Frameworks
- Express - backend web application framework for Node.js

## System Overview

## Project Status
Week 01 
- Understanding project objectives
- Understanding and identifying possible attack surfaces in a web application

Week 02
- Understanding how a web application works
- Building a simple web application skeleton designed to be intentionally vulnerable

Week 03
- Added product search and profile search through URL feautures
- Both new search features are designed to be intentionally vulnerable, especially to injection
- Added a comment box that dispalys user comments without HTML eclipising (meant for XSS scritpting later)
- Mapped all vulnerable components to appropriate OWASP Top 10 vulnerabilities

Week 04
- 
