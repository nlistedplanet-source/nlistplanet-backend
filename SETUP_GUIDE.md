# 🚀 UnlistedHub - Complete Setup Guide

## Step 1: MongoDB Setup (3 Options)

### Option A: MongoDB Atlas (FREE - Recommended)

1. **Account बनाएं:**
   - https://www.mongodb.com/cloud/atlas पर जाएं
   - "Try Free" पर click करें
   - Google से sign up करें

2. **Cluster बनाएं:**
   - "Build a Database" select करें
   - **M0 (FREE)** plan चुनें
   - Region: **Mumbai (ap-south-1)** चुनें
   - "Create" पर click करें

3. **Database User बनाएं:**
   - "Security" → "Database Access" पर जाएं
   - "Add New Database User" पर click करें
   - Username: `unlistedhub`
   - Password: Generate करें और save करें
   - "Database User Privileges": "Read and write to any database"
   - "Add User" पर click करें

4. **Network Access:**
   - "Security" → "Network Access"
   - "Add IP Address" पर click करें
   - "Allow Access from Anywhere" चुनें (development के लिए)
   - "Confirm"

5. **Connection String Copy करें:**
   - "Database" → "Connect" → "Connect your application"
   - Driver: **Node.js**, Version: **4.1 or later**
   - Connection string copy करें:
   ```
   mongodb+srv://unlistedhub:<password>@cluster0.xxxxx.mongodb.net/unlistedhub
   ```
   - `<password>` को अपने actual password से replace करें

6. **.env में paste करें:**
   ```env
   MONGODB_URI=mongodb+srv://unlistedhub:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/unlistedhub
   ```

---

### Option B: Local MongoDB (अगर आपके पास installed है)

```env
MONGODB_URI=mongodb://localhost:27017/unlistedhub
```

---

## Step 2: Gmail App Password Setup

1. **Google Account Settings:**
   - https://myaccount.google.com/ पर जाएं
   - "Security" पर click करें

2. **2-Step Verification Enable करें:**
   - "2-Step Verification" पर click करें
   - Follow steps to enable

3. **App Password बनाएं:**
   - https://myaccount.google.com/apppasswords
   - "Select app": **Mail**
   - "Select device": **Other (Custom name)**
   - Name: "UnlistedHub Backend"
   - "Generate" पर click करें

4. **16-digit password copy करें:**
   ```
   xxxx xxxx xxxx xxxx
   ```

5. **.env में add करें:**
   ```env
   EMAIL_USER=nlistedplanet@gmail.com
   EMAIL_PASSWORD=xxxx xxxx xxxx xxxx
   ```

---

## Step 3: Twilio SMS Setup (OPTIONAL)

### FREE में test करने के लिए:

1. **Twilio Account:**
   - https://www.twilio.com/try-twilio पर जाएं
   - Sign up करें (FREE $15 credit मिलता है)

2. **Phone Number लें:**
   - Console → "Get a Trial Number"
   - Indian number मिल सकता है

3. **Credentials Copy करें:**
   - Console → "Account Info"
   - Account SID copy करें
   - Auth Token copy करें

4. **.env में add करें:**
   ```env
   TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxx
   TWILIO_AUTH_TOKEN=your_auth_token
   TWILIO_PHONE_NUMBER=+1234567890
   ```

**Note:** Twilio optional है। Email OTP काम करेगा।

---

## Step 4: Start Backend Server

```bash
cd UnlistedHub-Backend
npm run dev
```

✅ अगर सब ठीक है तो दिखेगा:
```
🚀 Server running on http://localhost:5000
✅ MongoDB Connected
```

---

## Step 5: Test API

### Postman/Thunder Client से test करें:

**1. Health Check:**
```http
GET http://localhost:5000/api/health
```

**2. Sign Up:**
```http
POST http://localhost:5000/api/auth/signup
Content-Type: application/json

{
  "name": "Test User",
  "email": "your-email@gmail.com",
  "password": "test123",
  "mobile": "+919876543210"
}
```

**3. Send Email OTP:**
```http
POST http://localhost:5000/api/auth/send-email-otp
Content-Type: application/json

{
  "email": "your-email@gmail.com"
}
```

Check your email! ✅

---

## Step 6: Connect Frontend to Backend

### React project में changes:

1. **Install axios:**
   ```bash
   cd UnlistedHub-React-Project
   npm install axios
   ```

2. **Create API service file:**
   `src/services/api.js`

3. **Update AuthContext** to use backend APIs

---

## 📝 Checklist

- [ ] MongoDB Atlas account बनाया?
- [ ] Connection string copy किया?
- [ ] Gmail App Password बनाया?
- [ ] `.env` file में values भरीं?
- [ ] `npm run dev` से server start किया?
- [ ] "MongoDB Connected" message दिखा?
- [ ] Postman से API test किया?
- [ ] Email OTP receive हुआ?

---

## ❓ Common Issues

### Error: "MongooseError: The `uri` parameter to `openUri()` must be a string"
**Fix:** `.env` में `MONGODB_URI` properly set करें

### Error: "Invalid login: 535-5.7.8 Username and Password not accepted"
**Fix:** Gmail App Password correctly copy करें (spaces remove करें)

### Email OTP नहीं आ रहा?
**Check:**
- Gmail App Password correct है?
- Spam folder check किया?
- 2-Step Verification enabled है?

---

**क्या help चाहिए?** मुझे बताइए कौन सा step करना है!
