# 🎖️ Shop Karo - E-Commerce with Military Verification

Flipkart-like e-commerce platform built with MongoDB, Express, React, and Node.js.
**Now with professional military personnel verification system!**

## 🚀 Project Status

✅ **FEATURE COMPLETE - TESTING PHASE**

| Component | Status |
|-----------|--------|
| Core E-Commerce | ✅ Complete |
| Admin Dashboard | ✅ Complete |
| User Authentication | ✅ Complete |
| **Military Verification** | ✅ **Complete** |
| Responsive Design | ✅ Complete |
| Testing Documentation | ✅ Complete |

## 📚 Documentation

**Start here for complete understanding:**

1. **[SESSION_SUMMARY.md](SESSION_SUMMARY.md)** ⭐ - What was fixed today
2. **[QUICK_START_TESTING.md](QUICK_START_TESTING.md)** 🧪 - Testing guide (20-30 min)
3. **[ADMIN_VERIFICATION_GUIDE.md](ADMIN_VERIFICATION_GUIDE.md)** 📖 - Detailed reference
4. **[IMPLEMENTATION_CHECKLIST.md](IMPLEMENTATION_CHECKLIST.md)** ✅ - Technical details

## 🎯 Quick Start

```bash
# 1. Add test military user
cd backend
node scripts/seedMilitaryUser.js

# 2. Start backend
npm start

# 3. Start frontend (in another terminal)
cd frontend
npm start

# 4. Test verification
# Login: seller@shopkaro.com / seller123
# Click 🎖️ Verify button
```

## 🎖️ Military Verification Features

- ✅ Special registration form for military personnel
- ✅ ID card image upload with automatic compression
- ✅ Admin dashboard to review and approve applications
- ✅ Verification status tracking
- ✅ Page persistence using localStorage
- ✅ Route protection for pending registrations
- ✅ Secure JWT-based authentication

## Features

### User Features
- User Authentication (Register, Login, Logout)
- **Military Personnel Verification** (NEW!)
- Product Browsing & Search
- Product Filtering by Category
- Shopping Cart Management
- Checkout Process
- Order Placement
- Order Tracking
- User Profile Management
- Product Reviews & Ratings

### Admin Features
- Product Management (Create, Update, Delete)
- Order Management
- **Military Verification Dashboard** (NEW!)
- User Management
- Sales Analytics

## Tech Stack

### Frontend
- React 18
- React Router DOM v6
- Zustand (State Management)
- Axios (HTTP Client)
- **Canvas API** (Image compression)
- CSS3

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT (Authentication)
- Bcrypt (Password Hashing)
- Cors
- Multer (File Upload)

## Project Structure

```
├── frontend/                 # React Frontend
│   ├── public/
│   ├── src/
│   │   ├── components/       # Reusable Components
│   │   ├── pages/            # Page Components
│   │   ├── services/         # API Services
│   │   ├── context/          # Global State (Zustand)
│   │   ├── styles/           # CSS Files
│   │   └── App.js
│   └── package.json
│
└── backend/                  # Node.js Backend
    ├── models/               # Database Models
    ├── routes/               # API Routes
    ├── controllers/          # Route Controllers
    ├── middleware/           # Custom Middleware
    ├── config/               # Configuration Files
    ├── server.js             # Entry Point
    └── package.json
```

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (Local or Cloud)
- npm or yarn

### Backend Setup

1. Navigate to backend folder:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Update `.env` with your configuration:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ecommerce-app
JWT_SECRET=your_secret_key_here
JWT_EXPIRE=7d
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

5. Start backend server:
```bash
npm run dev
```

Backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend folder:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env.local` file:
```
REACT_APP_API_URL=http://localhost:5000/api
```

4. Start frontend:
```bash
npm start
```

Frontend will run on `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product details
- `POST /api/products` - Create product (Auth required)
- `PUT /api/products/:id` - Update product (Auth required)
- `DELETE /api/products/:id` - Delete product (Auth required)

### Cart
- `GET /api/cart` - Get user's cart (Auth required)
- `POST /api/cart/add` - Add item to cart (Auth required)
- `DELETE /api/cart/remove/:productId` - Remove from cart (Auth required)
- `DELETE /api/cart/clear` - Clear cart (Auth required)

### Orders
- `POST /api/orders` - Create order (Auth required)
- `GET /api/orders` - Get user's orders (Auth required)
- `GET /api/orders/:id` - Get order details (Auth required)
- `PUT /api/orders/:id/status` - Update order status (Admin required)

### Users
- `GET /api/users/profile` - Get user profile (Auth required)
- `PUT /api/users/profile` - Update profile (Auth required)
- `POST /api/users/change-password` - Change password (Auth required)

### Reviews
- `GET /api/reviews/product/:productId` - Get product reviews
- `POST /api/reviews` - Create review (Auth required)
- `PUT /api/reviews/:id` - Update review (Auth required)
- `DELETE /api/reviews/:id` - Delete review (Auth required)

## Customization

### Changing App Name

1. **Update Frontend App Name:**
   - Edit `frontend/public/index.html` - Change `<title>`
   - Edit `frontend/src/components/Header.js` - Change logo text
   - Edit `frontend/package.json` - Change `"name"` field

2. **Update Backend App Name:**
   - Edit `backend/package.json` - Change `"name"` field
   - Edit `backend/.env` - Update any app-specific configs

### Changing Colors/Theme

Update CSS files in `frontend/src/styles/`:
- Primary Color: `#ff9900` (Orange) → Change to your color
- Secondary Color: `#132f4c` (Dark Blue) → Change to your color
- Accent Color: `#4caf50` (Green) → Change to your color

### Changing Database

Update `MONGODB_URI` in `backend/.env`:
```
# Local MongoDB
MONGODB_URI=mongodb://localhost:27017/your-app-name

# MongoDB Atlas (Cloud)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database-name
```

## Deployment

### Frontend Deployment (Vercel/Netlify)

1. Build production bundle:
```bash
cd frontend
npm run build
```

2. Deploy `build` folder to Vercel or Netlify

### Backend Deployment (Heroku/Render)

1. Create `Procfile`:
```
web: node server.js
```

2. Deploy to Heroku:
```bash
heroku login
heroku create your-app-name
git push heroku main
```

3. Set environment variables on platform

### MongoDB Atlas Setup

1. Create account at https://www.mongodb.com/cloud/atlas
2. Create cluster
3. Get connection string
4. Update `MONGODB_URI` in `.env`

## Testing

### Sample Test Users

**Admin:**
- Email: `admin@ecommerce.com`
- Password: `admin123`

**Regular User:**
- Email: `user@example.com`
- Password: `password123`

## Features to Add (Future)

- [ ] Payment Gateway Integration (Stripe/Razorpay)
- [ ] Email Notifications
- [ ] Image Upload (Cloudinary)
- [ ] Advanced Filtering & Sorting
- [ ] Wishlist Feature
- [ ] Product Recommendations
- [ ] Admin Dashboard
- [ ] Seller Panel
- [ ] Social Authentication
- [ ] PWA Support
- [ ] Performance Optimization

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running
- Check connection string in `.env`
- Verify firewall settings

### Frontend API Errors
- Check backend is running on port 5000
- Verify `REACT_APP_API_URL` in frontend `.env`
- Check CORS settings in `backend/server.js`

### Port Already in Use
```bash
# Find and kill process on port
npx kill-port 5000  # Backend
npx kill-port 3000  # Frontend
```

## Contributing

1. Create feature branch: `git checkout -b feature/feature-name`
2. Commit changes: `git commit -am 'Add new feature'`
3. Push to branch: `git push origin feature/feature-name`
4. Submit Pull Request

## License

MIT License - feel free to use this project

## Support

For issues and questions, create an issue in the repository.

---

**Happy Coding! 🚀**
