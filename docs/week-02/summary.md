- Implemented a simple web server
- It consists of a database that stores user credentials in plain text

##### Data Flow Between Browser and Server
- The browser (client) sends an HTTP request to the server
- In the context of login, user-entered credentials would be captured by the browser and packaged into a POST request to the server's authentication endpoint
- The server-side application built iwth Node.js extracts the credentials
(Secure authentication logic is yet to be implemented)

##### Where Credentials Are Stored
- Credentials are stored in database.db in plain text
- Anyone with access to the file can view all credentials

##### Security Vulnerabilities
- Plain test password storage exposes all credentials instantly to anyone who accesses the database file
- SQL injection due to string interpolation in database queries
- Internal error messages are displayed to the user which can give a potential attacker information about the database to refine their injection attempts. Secure apps should return something generic such as "something went wrong" and log the error privately on the server
- No session is created after successful login. Authentication doesn't persist so access control is impossible
- No HTTPS so credentials are transmitted unencrypted over the network
