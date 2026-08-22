# Business Card Scanner - Backend

Complete MERN backend for business card scanning application with OCR processing and Google Contacts integration.

## Features

- 🔐 **Authentication**: JWT-based auth with Google OAuth support
- 📸 **OCR Processing**: Extract business card data using Tesseract.js
- 📇 **Business Card Management**: Full CRUD operations
- 🔄 **Google Contacts Sync**: Automatic sync to Google Contacts
- 👥 **Admin Panel**: Role-based admin system (Admin & Super Admin)
- 🔒 **Permissions**: Granular permission control for admins

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env` and update the values:

```bash
cp .env.example .env
```

Required variables:

- `MONGODB_URI`: Your MongoDB connection string
- `JWT_SECRET`: Secret key for JWT tokens
- `GOOGLE_CLIENT_ID`: Google OAuth client ID
- `GOOGLE_CLIENT_SECRET`: Google OAuth client secret

### 3. Start MongoDB

Make sure MongoDB is running on your system.

### 4. Create Super Admin

```bash
npm run seed:admin
```

Default credentials:

- Email: `superadmin@businesscard.com`
- Password: `SuperAdmin@123`

**⚠️ Change the password after first login!**

### 5. Run the Server

Development mode:

```bash
npm run dev
```

Production mode:

```bash
npm start
```

Server will run on `http://localhost:5000`

## API Endpoints

### Authentication (`/api/auth`)

- `POST /register` - Register new user
- `POST /login` - Login user
- `GET /google` - Get Google OAuth URL
- `GET /google/callback` - Google OAuth callback
- `GET /me` - Get current user (Protected)
- `POST /logout` - Logout user (Protected)

### Business Cards (`/api/cards`)

- `POST /` - Upload and scan business card (Protected)
- `GET /` - Get all user's cards (Protected)
- `GET /stats` - Get user statistics (Protected)
- `GET /:id` - Get single card (Protected)
- `PUT /:id` - Update card (Protected)
- `DELETE /:id` - Delete card (Protected)

### Google Contacts (`/api/google`)

- `POST /sync/:cardId` - Sync card to Google Contacts (Protected)
- `POST /sync-all` - Sync all cards (Protected)
- `DELETE /sync/:cardId` - Remove card from Google Contacts (Protected)
- `GET /status` - Get sync status (Protected)

### Admin (`/api/admin`)

- `POST /login` - Admin login
- `GET /analytics` - Get dashboard analytics (Admin)
- `GET /users` - Get all users (Admin)
- `GET /users/:id` - Get user details (Admin)
- `PUT /users/:id` - Update user (Admin)
- `DELETE /users/:id` - Delete user (Admin)
- `GET /cards` - Get all cards (Admin)
- `DELETE /cards/:id` - Delete card (Admin)
- `GET /admins` - Get all admins (Super Admin)
- `POST /admins` - Create admin (Super Admin)
- `PUT /admins/:id` - Update admin permissions (Super Admin)
- `DELETE /admins/:id` - Delete admin (Super Admin)

## Project Structure

```
server/
├── controllers/       # Request handlers
├── middlewares/       # Express middlewares
├── models/           # Mongoose models
├── routes/           # API routes
├── scripts/          # Utility scripts
├── utils/            # Helper functions & services
├── uploads/          # Uploaded images
├── .env              # Environment variables
├── .env.example      # Environment template
├── package.json      # Dependencies
└── server.js         # Entry point
```

## Technologies

- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Tesseract.js** - OCR processing
- **Google APIs** - OAuth & Contacts sync
- **Multer** - File uploads
- **Sharp** - Image processing
- **bcryptjs** - Password hashing

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable Google+ API and People API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:5000/api/auth/google/callback`
6. Copy Client ID and Client Secret to `.env`

## License

MIT
