-> Logincodespace-01

A secure user authentication system built with Node.js, Express.js, and MongoDB featuring JWT-based authentication and password encryption.

-> Features

- User registration with secure password hashing using BCrypt npm module
- JWT-based login with cookie management
- Profile view and update functionality
- Store data in MongoDB database 
- CSV storing and export of user data
- Protected routes with authentication middleware

-> Tech Stack

->> Node.js & Express.js - Backend framework
->> MongoDB & Mongoose - Database
->> JWT - Authentication
->> BCrypt - Password encryption
->> dotenv - Environment variables

-> Installation

1. Clone the repository:
```
git clone https://github.com/Thesageof69/Logincodespace-01.git
cd Logincodespace-01
```

2. Install dependencies:
```
npm install
```

3. Configure environment variables in .env:
```
PORT=3000
MONGODB_URI=mongodb_connection_string
JWT_SECRET=jwt_secret_key
```

4. Start the server:
```
node login.js
```

Server runs on `http://localhost:3000`

-> API Endpoints

->> POST `/register`
To register a new user
```
{
  "FirstName": "Milan",
  "LastName": "Sam",
  "Email": "milan@gamil.com",
  "Password": "password123"
}
```

-> POST `/login`
Authenticate user
```
{
  "Email": "milan@gmail.com",
  "Password": "password123"
}
```

->> GET `/profile` 
Get user profile (requires authentication)

->> PUT `/profile`
Update user profile (requires authentication)

-> Project Structure

```
├── login.js       # Main application file
├── database.js    # MongoDB connection
├── user.js        # User schema
├── users.csv      # User data export
└── .env           # Environment variables
```

-> Security Features

- BCrypt password hashing (10)
- JWT tokens with 2-hour expiration
- HTTP-only cookies
- Protected routes with authentication middleware

-> Author

Thesageof69
- GitHub: [@Thesageof69](https://github.com/Thesageof69)
