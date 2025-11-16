# Copilot Instructions for UnlistedHub-Backend

## Big Picture Architecture
- **Purpose:** Node.js + Express backend for UnlistedHub, a P2P marketplace for unlisted shares.
- **Core domains:** User authentication (JWT, OTP), Listings, Bids, Transactions, Admin controls.
- **Data flow:** RESTful API, MongoDB for persistence, email/mobile OTP via Gmail/Twilio.
- **Major boundaries:**
  - `models/`: Mongoose schemas for User, Listing, Trade, Portfolio.
  - `routes/`: API endpoints grouped by domain (auth, listings, bids, users, trades, companies, portfolio).
  - `middleware/`: Auth/admin checks, OTP validation.
  - `utils/`: OTP service, helpers.

## Developer Workflows
- **Install:** `npm install`
- **Dev server:** `npm run dev` (nodemon)
- **Production:** `npm start`
- **Database reset:** `node scripts/resetDatabase.js` (see `scripts/README.md`)
- **Test:** No formal test suite; manual API testing via Postman/Thunder Client recommended.

## Environment & Integration
- **MongoDB:** Local, Atlas, or Cloud. Set `MONGODB_URI` in `.env`.
- **Email OTP:** Gmail App Password required (`EMAIL_USER`, `EMAIL_PASSWORD`).
- **SMS OTP:** Twilio credentials (`TWILIO_ACCOUNT_SID`, etc.) are optional.
- **Frontend integration:** CORS enabled for trusted domains; set `FRONTEND_URL` in `.env`.

## Project-Specific Patterns & Gotchas
- **OTP flows:** Email/mobile OTP endpoints in `routes/auth.js`, logic in `utils/otpService.js`.
- **Admin user:** Created/reset via `scripts/resetDatabase.js` (see credentials in `scripts/README.md`).
- **User roles:** Role-based access enforced in `middleware/admin.js` and `middleware/auth.js`.
- **Listings & bids:** Listings are created via `/api/listings/sell`, bids via `/api/listings/:id/bid`. Admin approval required for finalizing transactions.
- **Data model:** See `models/Listing.js`, `models/Trade.js`, `models/User.js`, `models/Portfolio.js` for schema details.
- **No test coverage:** Manual API testing only; keep changes small and validate endpoints after edits.

## Common Debugging & Edits
- **Reset DB:** Run `node scripts/resetDatabase.js` to clear users and create a fresh admin.
- **Check API:** Use Postman/Thunder Client for endpoint validation (see README for sample requests).
- **Update environment:** Always restart server after `.env` changes.
- **Error handling:** Most errors are returned as JSON with status codes; check route handlers for conventions.

## Key Files & Directories
- `server.js`: Entry point, Express app setup.
- `models/`: Mongoose schemas.
- `routes/`: API endpoints.
- `middleware/`: Auth/admin logic.
- `utils/otpService.js`: OTP generation/validation.
- `scripts/resetDatabase.js`: DB reset utility.

## Example API Flows
- **Sign up:** `POST /api/auth/signup` (see README for payload)
- **Sign in:** `POST /api/auth/signin`
- **Send OTP:** `POST /api/auth/send-email-otp` or `/send-mobile-otp`
- **Create listing:** `POST /api/listings/sell`
- **Place bid:** `POST /api/listings/:id/bid`

## PR Checklist
- Data flows consistent (models/routes/middleware)
- Environment variables documented/updated
- Manual API tests run for new/changed endpoints
- No sensitive info committed (e.g., `.env`)

---
If any section is unclear or missing, please specify which area needs more detail (e.g., API flows, model structure, integration patterns) and I will iterate.