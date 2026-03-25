#### Updates to HackShield Web App
- Added product and profile search through URL without input sanitisation (vulnerable to SQL injection)
- Added comments box feature without HTML escaping (vulnerable to XSS)

#### Why is a raw SQL dangerous?
Raw SQL means that SQL statements are wrtitten and executed directly in application code, allowing an app to communicate with its database directly. This means that user inputs are directly queried into SQL statements - therefore, malicious SQL code such as ' OR '1'='1'-- can be injected into the queries. Because these statements always return return, a malicious user can get unauthorised access into the application's database. 

#### Trust Boundary
A trust boundary is a conceptual boundary that separates internal components (belonging to an individual or corporation) from external users. It is important that the boundary enforces proper validation to prevent external users from violating confidentiality boundaries.
