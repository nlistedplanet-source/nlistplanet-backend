# UnlistedHub USM - Setup Guide

## 🎉 Project Created Successfully!

Your new mobile-first UnlistedHub USM project has been created with the following structure:

```
UnlistedHub-USM/
├── backend/          # Node.js + Express + MongoDB API
│   ├── models/       # Database models (User, Listing, Notification, etc.)
│   ├── routes/       # API routes (auth, listings, notifications, etc.)
│   ├── middleware/   # Authentication middleware
│   ├── server.js     # Express server
│   └── package.json
│
└── frontend/         # React + Tailwind CSS (Mobile-First)
    ├── src/
    │   ├── components/   # Reusable UI components
    │   ├── pages/        # Page components
    │   ├── context/      # React Context (Auth)
    │   ├── utils/        # Helper functions and API calls
    │   ├── App.jsx       # Main app component
    │   └── index.css     # Mobile-first styles
    └── package.json
```

## 📱 Mobile-First Design Features

✅ Touch-friendly buttons and inputs
✅ Bottom navigation bar (native app feel)
✅ Optimized for thumb reach
✅ Safe area support (notch/island)
✅ Pull-to-refresh ready
✅ Smooth animations and transitions
✅ No zoom on input focus (iOS)

## 🚀 Setup Instructions

### Step 1: Install Backend Dependencies

```powershell
cd backend
npm install
```

### Step 2: Setup Backend Environment

1. Copy `.env.example` to `.env`:
```powershell
Copy-Item .env.example .env
```

2. Edit `.env` file and update:
   - `MONGODB_URI`: Your MongoDB connection string
   - `JWT_SECRET`: A random secure string (min 32 characters)
   - Other settings as needed

### Step 3: Start MongoDB

Make sure MongoDB is running on your system:
```powershell
# If using MongoDB locally
mongod
```

Or use MongoDB Atlas (cloud) and update MONGODB_URI in .env

### Step 4: Start Backend Server

```powershell
# Development mode with auto-reload
npm run dev

# Or production mode
npm start
```

Backend will run on: http://localhost:5000

### Step 5: Install Frontend Dependencies

Open a new terminal:
```powershell
cd ..\frontend
npm install
```

### Step 6: Setup Frontend Environment

1. Copy `.env.example` to `.env`:
```powershell
Copy-Item .env.example .env
```

2. The default values should work if backend is on localhost:5000

### Step 7: Start Frontend App

```powershell
npm start
```

Frontend will run on: http://localhost:3000

## 🎨 Design Philosophy

### Mobile-First Approach
- Every component is designed for mobile devices first
- Desktop is treated as an enhancement, not the default
- Touch-friendly UI with larger hit areas
- Native app-like experience

### Color Scheme
- **Primary**: Blue (#0ea5e9) - Trust and professionalism
- **Dark**: Slate grays - Modern and clean
- **White**: Clean backgrounds
- **Accent colors**: For status badges and alerts

### Typography
- **Font**: Inter - Modern, readable, optimized for screens
- **Sizes**: Mobile-optimized with minimum 16px for inputs (prevents iOS zoom)

### Components
- **Cards**: Rounded corners (rounded-2xl), shadow-mobile
- **Buttons**: Large touch areas (py-3), rounded-xl
- **Inputs**: Consistent styling, clear focus states
- **Bottom Nav**: Fixed at bottom, 4 main sections
- **Top Bar**: Shows branding and user info

## 📱 Testing on Mobile

### Test on Real Device (Best Option)

1. Get your computer's local IP:
```powershell
ipconfig
# Look for IPv4 Address (e.g., 192.168.1.100)
```

2. Update frontend `.env`:
```
REACT_APP_API_URL=http://YOUR_IP:5000/api
```

3. Start both servers

4. On your phone (connected to same WiFi):
   - Open browser
   - Navigate to: `http://YOUR_IP:3000`

### Test with Browser DevTools

1. Open Chrome DevTools (F12)
2. Click "Toggle device toolbar" (Ctrl+Shift+M)
3. Select a mobile device (iPhone, Pixel, etc.)
4. Test touch interactions

## 🛠️ Development Workflow

### Adding New Features

The project is structured to easily add features:

1. **Backend**: Add routes in `backend/routes/`
2. **Frontend API**: Update `frontend/src/utils/api.js`
3. **UI Components**: Create in `frontend/src/components/`
4. **Pages**: Add to `frontend/src/pages/`
5. **Context**: Add to `frontend/src/context/` if needed

### Current Implementation Status

✅ **Completed**:
- Project structure
- Backend models and API routes
- Authentication system
- Mobile-first UI framework
- Home page with features
- Login/Register pages
- Bottom navigation
- Top bar with user info
- Loading screens

⏳ **TODO** (Next Steps):
- Marketplace page with SELL/BUY tabs
- Dashboard with 6 tabs
- Listing cards with boost/share
- Bid/Offer modals
- Notification dropdown
- Counter offer system
- Share modal with affiliate tracking
- Company management
- Admin dashboard

## 📖 API Endpoints

### Auth Routes
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/change-password` - Change password
- `PUT /api/auth/profile` - Update profile

### Listings Routes
- `GET /api/listings` - Get marketplace listings
- `GET /api/listings/my` - Get user's listings
- `POST /api/listings` - Create new listing
- `POST /api/listings/:id/bid` - Place bid/offer
- `PUT /api/listings/:id/boost` - Boost listing

### Notifications Routes
- `GET /api/notifications` - Get notifications
- `PUT /api/notifications/:id/read` - Mark as read
- `PUT /api/notifications/read-all` - Mark all as read

### Companies Routes
- `GET /api/companies` - Get all companies
- `GET /api/companies/:id` - Get company by ID

### Admin Routes (Requires admin role)
- `GET /api/admin/stats` - Platform statistics
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id/ban` - Ban/unban user
- `POST /api/admin/companies` - Create company

## 🔒 Security Features

- JWT authentication with secure tokens
- Password hashing with bcrypt
- Protected routes with middleware
- CORS configuration
- Helmet.js security headers
- Input validation
- Rate limiting ready (add as needed)

## 📊 Database Models

### User Model
- Username (unique, lowercase)
- Email, password, full name, phone
- Role (user/admin)
- Referral tracking
- Ban status

### Listing Model
- Type (sell/buy)
- Company, price, quantity, min lot
- Bids/offers arrays
- Boost status
- Counter offer history

### Notification Model
- User, type, title, message
- Action data and URL
- Read status

### Transaction Model
- Type (platform fee, boost, affiliate)
- Amount, parties involved
- Company and description

### Company Model
- Name, logo, sector
- ISIN, PAN, CIN
- Website, founded year
- Listing count

## 🎯 Next Development Steps

1. **Marketplace Page**: Create tabs, filters, listing cards
2. **Dashboard Tabs**: My posts, bids/offers, notifications, profile
3. **Listing Creation**: Modal with company search, price, quantity
4. **Bid/Offer Flow**: Modals with counter offer system
5. **Notifications**: Real-time updates, quick actions
6. **Share System**: Deep links with affiliate tracking
7. **Admin Panel**: User management, analytics, settings

## 📝 Notes

- Old project moved to: `old-project/UnlistedHub-React-Project-OLD/`
- Mobile-first design means mobile is the primary experience
- All components use Tailwind CSS utility classes
- Icons from lucide-react (tree-shakeable)
- Toast notifications for user feedback
- Safe area support for iOS notch/Dynamic Island

## 🆘 Common Issues

### Port Already in Use
```powershell
# Kill process on port 3000 or 5000
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process
```

### MongoDB Connection Error
- Make sure MongoDB is running
- Check MONGODB_URI in .env
- Verify MongoDB is accessible

### CORS Errors
- Check FRONTEND_URL in backend .env
- Make sure both servers are running
- Clear browser cache

## 📱 Recommended Mobile Testing

Test on these screen sizes:
- iPhone SE (375x667) - Smallest modern iPhone
- iPhone 12/13/14 (390x844) - Most common
- iPhone 14 Pro Max (430x932) - Largest iPhone
- Samsung Galaxy S21 (360x800) - Common Android
- iPad Mini (768x1024) - Tablet view

---

Happy Coding! 🚀

For questions or issues, check the main README.md or create an issue.
