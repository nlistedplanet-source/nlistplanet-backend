# UnlistedHub Backend API

Backend server for UnlistedHub - P2P marketplace for unlisted shares.

## 🚀 Features

- ✅ User Authentication (JWT)
- ✅ Email OTP Verification
- ✅ Mobile OTP Verification  
- ✅ Listing Management
- ✅ Bidding System
- ✅ MongoDB Database
- ✅ RESTful API

## 📋 Prerequisites

- Node.js (v14+)
- MongoDB (local or Atlas)
- Gmail App Password (for email OTP)
- Twilio Account (for SMS OTP) - Optional

## 🔧 Installation

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Environment Variables

Create `.env` file और ये values भरें:

```env
# MongoDB - ये 3 options में से कोई एक choose करें:

# Option 1: Local MongoDB
MONGODB_URI=mongodb://localhost:27017/unlistedhub

# Option 2: MongoDB Atlas (FREE)
# 1. https://www.mongodb.com/cloud/atlas पर जाएं
# 2. Free cluster बनाएं
# 3. Connection string copy करें:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/unlistedhub

# Option 3: MongoDB Cloud (Recommended for testing)
# मैं आपको setup करवा सकता हूं

# JWT Secret (कोई भी random string)
JWT_SECRET=my-super-secret-key-123456789

# Email Configuration (Gmail)
EMAIL_USER=nlistedplanet@gmail.com
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx
# Gmail App Password कैसे बनाएं:
# 1. https://myaccount.google.com/apppasswords
# 2. "Select app" में "Mail" चुनें
# 3. "Select device" में "Other" चुनें
# 4. 16-digit password copy करें

# SMS Configuration (Twilio) - OPTIONAL
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token  
TWILIO_PHONE_NUMBER=+1234567890
# Twilio Setup:
# 1. https://www.twilio.com/try-twilio पर free account बनाएं
# 2. Phone number लें (free में $15 credit मिलता है)
# 3. Account SID और Auth Token copy करें

# Server
PORT=5000
FRONTEND_URL=http://localhost:3000
```

### 3. Start MongoDB (if using local)

```bash
# Windows में:
# MongoDB Compass खोलें या
mongod
```

### 4. Run Server

```bash
# Development mode (auto-restart)
npm run dev

# Production mode
npm start
```

Server will run on `http://localhost:5000`

## 📡 API Endpoints

### Authentication

```
POST /api/auth/signup          - Register new user
POST /api/auth/signin          - Login user
POST /api/auth/send-email-otp  - Send email OTP
POST /api/auth/verify-email-otp - Verify email OTP
POST /api/auth/send-mobile-otp - Send mobile OTP
POST /api/auth/verify-mobile-otp - Verify mobile OTP
```

### Listings

```
GET  /api/listings             - Get all listings
POST /api/listings/sell        - Create sell listing (requires auth)
POST /api/listings/:id/bid     - Place bid on listing (requires auth)
```

### Users

```
GET /api/users                 - Get all users (requires auth)
GET /api/users/:id             - Get user by ID (requires auth)
```

## 🧪 Test API

### Using Postman/Thunder Client

**1. Sign Up:**
```http
POST http://localhost:5000/api/auth/signup
Content-Type: application/json

{
  "name": "Test User",
  "email": "test@gmail.com",
  "password": "password123",
  "mobile": "+919876543210",
  "userType": "individual"
}
```

**2. Sign In:**
```http
POST http://localhost:5000/api/auth/signin
Content-Type: application/json

{
  "email": "test@gmail.com",
  "password": "password123"
}
```

**3. Send Email OTP:**
```http
POST http://localhost:5000/api/auth/send-email-otp
Content-Type: application/json

{
  "email": "test@gmail.com"
}
```

## 📝 Next Steps

1. ✅ Backend setup complete
2. ⏳ Configure MongoDB
3. ⏳ Configure Email (Gmail App Password)
4. ⏳ Configure SMS (Twilio) - Optional
5. ⏳ Connect Frontend to Backend
6. ⏳ Deploy to Cloud

## 🔒 Security Notes

- Never commit `.env` file
- Use strong JWT_SECRET in production
- Enable CORS only for trusted domains
- Use HTTPS in production

## 📞 Support

For setup help, ask me! मैं step-by-step guide करूंगा।

---

**Made with ❤️ for UnlistedHub**
