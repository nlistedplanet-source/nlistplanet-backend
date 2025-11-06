# Database Scripts

## Reset Database Script

The `resetDatabase.js` script is used to reset the MongoDB database and create a fresh admin user.

### Features:
- Deletes all existing users from database
- Creates a new admin user with random funny username
- Uses automatic username generator (same as UserDashboard)

### Admin Credentials:
```
Email: nlistedplanet@gmail.com
Password: Div@10390Beena
User ID: ADMIN001
Username: Auto-generated (e.g., @ironman__007, @tiger_legend, etc.)
```

### Usage:
```bash
node scripts/resetDatabase.js
```

### Note:
- Script is gitignored for security (contains passwords)
- Run locally when database reset is needed
- Each run generates a new random username
- All previous users are deleted
