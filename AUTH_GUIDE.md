# 🔐 Authentication & User System Guide

## Overview

Complete end-to-end authentication system with persistent sessions, user-specific chat history, order tracking, and protected routes.

## ✅ Features Implemented

### 1. **Authentication System**
- ✅ Secure login with bcrypt password hashing
- ✅ User registration with validation
- ✅ HTTP-only cookies for session management
- ✅ JWT token-based authentication
- ✅ Persistent sessions (7 days)
- ✅ Automatic session restoration on page reload

### 2. **User Management**
- ✅ User profile with name, email, phone, address
- ✅ Role-based access (admin/customer)
- ✅ Logout functionality
- ✅ Protected routes (redirect to login if not authenticated)

### 3. **Chat History**
- ✅ User-specific chat sessions
- ✅ Load previous chats from sidebar
- ✅ Persistent cart state per chat
- ✅ Auto-load chat history on login
- ✅ Guest mode for non-authenticated users

### 4. **Orders System**
- ✅ View all orders in dedicated orders page
- ✅ Order search in chatbot
- ✅ Order status tracking (pending/paid/failed)
- ✅ Order history with payment details
- ✅ Search orders by ID in chatbot

### 5. **Enhanced Navbar**
- ✅ Login/Logout buttons
- ✅ User profile dropdown
- ✅ "My Orders" link
- ✅ Cart badge for authenticated users
- ✅ Mobile responsive menu

## 🚀 Quick Start

### 1. Start Development Server
```bash
npm run dev
```

### 2. Register a New Account
1. Go to `http://localhost:3000/register`
2. Fill in:
   - Name: Your Name
   - Email: your@email.com
   - Password: minimum 6 characters
   - Phone (optional)
   - Address (optional)
3. Click "Create account"
4. You'll be automatically logged in and redirected to home

### 3. Login with Existing Account
1. Go to `http://localhost:3000/login`
2. Use demo accounts:
   - **Admin**: admin@agridelivery.com / admin123
   - **Customer**: customer@example.com / customer123
3. Click "Sign in"

## 📱 User Flow

### First Time User

```
1. Visit website (guest mode)
   ↓
2. Click "Sign Up" in navbar
   ↓
3. Fill registration form
   ↓
4. Auto-logged in with session cookie
   ↓
5. Can now:
   - Use chatbot (saved to user account)
   - Add items to cart
   - Place orders
   - View order history
```

### Returning User

```
1. Visit website
   ↓
2. Auto-authenticated from cookie
   ↓
3. See previous chat history in chatbot
   ↓
4. Access orders page
   ↓
5. Continue shopping
```

## 🔑 Authentication Flow

### Registration
```
User fills form
    ↓
Validate email format
    ↓
Validate password length (min 6)
    ↓
Hash password with bcrypt
    ↓
Store in MongoDB
    ↓
Generate JWT token
    ↓
Set HTTP-only cookie
    ↓
Return user object
```

### Login
```
User enters credentials
    ↓
Find user by email
    ↓
Compare password hash
    ↓
Generate JWT token
    ↓
Set HTTP-only cookie
    ↓
Return user object with token
```

### Session Persistence
```
Page loads
    ↓
Check for auth cookie
    ↓
Verify JWT token
    ↓
Load user data
    ↓
Set auth context
    ↓
User is authenticated
```

### Logout
```
User clicks logout
    ↓
Clear HTTP-only cookie
    ↓
Clear localStorage token
    ↓
Clear auth context
    ↓
Redirect to home
```

## 💬 Chatbot Integration

### Guest Users
- Chat ID: `guest_[timestamp]`
- Chats are ephemeral (session-based)
- Cart not saved to database
- Cannot place orders

### Authenticated Users
- Chat ID: Persistent UUID
- All chats saved to MongoDB
- Cart synced across sessions
- Can place orders
- Access previous chats via sidebar

### User-Specific Features

```javascript
// Chatbot automatically uses authenticated user ID
if (isAuthenticated && user) {
  userId = user.id  // MongoDB user ID
} else {
  userId = "guest_" + Date.now()
}

// Load chat sessions
GET /api/chatbot/sessions?userId={userId}

// Load specific chat
GET /api/chatbot/session/{chatId}?userId={userId}
```

## 📦 Orders Integration

### View Orders
```
Navbar → "Orders"
    ↓
Redirects to /orders
    ↓
Fetches user orders
    ↓
Displays order history with:
  - Order ID
  - Items with images
  - Total amount
  - Payment status
  - Timestamp
  - Payment ID
```

### Search Orders in Chatbot

**Example 1: View All Orders**
```
User: "Show my orders"
Bot: Lists last 3 orders with status
```

**Example 2: Search Specific Order**
```
User: "Where is my order 67a3b2c1?"
Bot: Order details, status, and items
```

**Example 3: Order Status**
```
User: "What's the status of my last order?"
Bot: Shows most recent order with payment status
```

## 🗄️ Database Collections

### users
```json
{
  "_id": ObjectId,
  "email": "user@example.com",
  "password": "$2b$10$hashedpassword",
  "name": "John Farmer",
  "phone": "+91-9876543210",
  "address": "Village, District",
  "role": "customer",
  "createdAt": Date,
  "updatedAt": Date
}
```

### chat_sessions
```json
{
  "_id": ObjectId,
  "user_id": "user_mongodb_id",  // authenticated user ID
  "chat_id": "uuid-v4",
  "title": "Chat about tomato seeds",
  "messages": [...],
  "cart": [...],
  "createdAt": Date,
  "updatedAt": Date
}
```

### orders
```json
{
  "_id": ObjectId,
  "user_id": "user_mongodb_id",
  "chat_id": "uuid-v4",
  "items": [...],
  "total_amount": 598,
  "payment_status": "paid",
  "razorpay_order_id": "order_xxx",
  "razorpay_payment_id": "pay_xxx",
  "razorpay_signature": "signature",
  "timestamp": Date
}
```

## 🔒 Security Features

### Password Security
- ✅ Bcrypt hashing with salt rounds: 10
- ✅ Minimum password length: 6 characters
- ✅ Never store plain text passwords
- ✅ Backward compatible (checks for hashed vs plain)

### Session Security
- ✅ HTTP-only cookies (not accessible via JavaScript)
- ✅ Secure flag in production (HTTPS only)
- ✅ SameSite: Lax (CSRF protection)
- ✅ 7-day expiration
- ✅ JWT with secret key

### API Security
- ✅ Auth middleware checks cookies
- ✅ Protected routes return 401 if unauthorized
- ✅ User can only access own data
- ✅ Order queries filtered by user_id

## 📍 API Endpoints

### Authentication
```
POST   /api/auth/login          - Login with email/password
POST   /api/auth/register       - Create new account
POST   /api/auth/logout         - Logout and clear session
GET    /api/auth/me             - Get current user info
```

### Orders
```
GET    /api/orders              - Get all user orders
GET    /api/orders/[orderId]    - Get specific order
```

### Chatbot (User-Aware)
```
POST   /api/chatbot/chat              - Send message (uses user ID)
GET    /api/chatbot/sessions          - Get user's chat sessions
GET    /api/chatbot/session/[chatId]  - Get specific chat
```

## 🎨 UI Components

### Login Page (`/login`)
- Email input with validation
- Password input
- Remember credentials
- Link to registration
- Demo account credentials displayed

### Register Page (`/register`)
- Full name (required)
- Email with format validation (required)
- Password with length validation (required)
- Phone (optional)
- Address (optional)
- Link to login

### Orders Page (`/orders`)
- Protected route (requires auth)
- Grid of order cards
- Order status badges
- Item thumbnails
- Total amount
- Date and payment ID
- Responsive layout

### Enhanced Navbar
- Logo and brand
- Navigation links
- Language switcher
- Shopping cart (with badge)
- User dropdown:
  - Profile info
  - My Orders
  - Logout button
- Mobile hamburger menu

## 🧪 Testing Guide

### Test 1: Registration Flow
```bash
# 1. Open register page
open http://localhost:3000/register

# 2. Fill form:
Name: Test User
Email: test@example.com
Password: test123

# 3. Submit
# Expected: Redirected to home, logged in
```

### Test 2: Login Flow
```bash
# 1. Open login page
open http://localhost:3000/login

# 2. Enter credentials:
Email: admin@agridelivery.com
Password: admin123

# 3. Submit
# Expected: Redirected to home, logged in
```

### Test 3: Persistent Session
```bash
# 1. Login
# 2. Close browser
# 3. Open browser again
# 4. Visit website
# Expected: Still logged in
```

### Test 4: Chatbot with Auth
```bash
# 1. Login
# 2. Open chatbot
# 3. Send: "Show me tomato seeds"
# 4. Add to cart
# 5. Close chatbot
# 6. Refresh page
# 7. Open chatbot
# Expected: Chat history and cart still there
```

### Test 5: Order Search
```bash
# 1. Login
# 2. Place an order (add to cart → checkout)
# 3. Go to Orders page
# 4. Note order ID
# 5. Open chatbot
# 6. Ask: "Show my orders"
# Expected: Bot lists your orders
```

### Test 6: Logout
```bash
# 1. Login
# 2. Click user dropdown
# 3. Click Logout
# Expected: 
#   - Redirected to home
#   - Navbar shows Login/Sign Up
#   - Cannot access /orders
```

## ⚙️ Configuration

### Environment Variables
```env
# MongoDB
MONGODB_URI=mongodb+srv://...

# JWT Secret (32+ characters recommended)
JWT_SECRET=your_very_secure_random_string_here

# Gemini AI
GEMINI_API_KEY=your_key

# Razorpay
RAZORPAY_KEY_ID=rzp_test_xxx
RAZORPAY_KEY_SECRET=your_secret
```

### Token Expiration
```typescript
// lib/auth.ts
{ expiresIn: "7d" }  // Change to "1d", "30d", etc.
```

### Cookie Settings
```typescript
// lib/auth.ts
{
  httpOnly: true,           // Cannot be accessed via JavaScript
  secure: NODE_ENV === "production",  // HTTPS only in production
  sameSite: "lax",          // CSRF protection
  maxAge: 60 * 60 * 24 * 7, // 7 days in seconds
  path: "/",
}
```

## 🐛 Troubleshooting

### Issue: Not staying logged in
**Solution**: Check browser allows cookies, verify JWT_SECRET is set

### Issue: Chat history not loading
**Solution**: Ensure user is authenticated, check MongoDB connection

### Issue: Orders page blank
**Solution**: Login first, orders are user-specific

### Issue: "Unauthorized" error
**Solution**: Session expired, login again

### Issue: Password not working
**Solution**: For seed data, use plain passwords. New users have hashed passwords.

## 🚢 Production Checklist

- [ ] Set strong JWT_SECRET (32+ random characters)
- [ ] Enable secure cookies (HTTPS)
- [ ] Hash all existing plain passwords in database
- [ ] Set up MongoDB indexes on user_id fields
- [ ] Add rate limiting to auth endpoints
- [ ] Enable CORS properly
- [ ] Add password reset functionality
- [ ] Implement refresh tokens
- [ ] Add email verification
- [ ] Set up session monitoring

## 📚 Code References

### Auth Context
`contexts/AuthContext.tsx` - React context for authentication state

### Auth Library
`lib/auth.ts` - JWT helpers, cookie management

### Auth Routes
- `app/api/auth/login/route.ts` - Login endpoint
- `app/api/auth/register/route.ts` - Registration endpoint
- `app/api/auth/logout/route.ts` - Logout endpoint
- `app/api/auth/me/route.ts` - Get current user

### UI Pages
- `app/login/page.tsx` - Login page
- `app/register/page.tsx` - Registration page
- `app/orders/page.tsx` - Orders page

### Chatbot Integration
- `components/chatbot/enhanced-chatbot.tsx` - Uses auth context
- `app/api/chatbot/chat/route.ts` - User-aware chat endpoint

## 🎉 Summary

You now have a complete authentication system with:
- Secure login/registration
- Persistent sessions
- User-specific chat history
- Order tracking
- Protected routes
- Beautiful UI
- Mobile responsive

Users can register, login, chat with the bot, place orders, and view their order history—all with persistent authentication!

---

**Ready to use!** 🚀

