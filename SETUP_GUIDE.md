# Complete Setup & Deployment Guide

## 📋 Table of Contents
1. [Initial Setup](#initial-setup)
2. [Development](#development)
3. [Customization](#customization)
4. [Deployment](#deployment)
5. [Troubleshooting](#troubleshooting)

---

## Initial Setup

### Prerequisites
- **Node.js** v14+ (Download from https://nodejs.org)
- **npm** or **yarn**
- **MongoDB** (Local or Cloud)
- **Git** (for version control)

### Verify Installation
```bash
node --version  # Should be v14+
npm --version   # Should be 6+
```

### Clone/Extract Project
```bash
cd Canteen  # Your project directory
```

---

## Development

### Quick Start (Recommended)

#### Option 1: Individual Terminals (Easier)

**Terminal 1 - Backend:**
```bash
cd backend
npm install
npm run dev
```
Backend runs on: `http://localhost:5000`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm install
npm start
```
Frontend runs on: `http://localhost:3000`

#### Option 2: Single Command (Advanced)

```bash
npm install -g concurrently
npm install
npm run dev
```

This runs both frontend and backend together.

### MongoDB Setup

#### Local MongoDB
1. Download from https://www.mongodb.com/try/download/community
2. Install and run
3. Use default connection: `mongodb://localhost:27017/ecommerce-app`

#### MongoDB Atlas (Cloud - Recommended)
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create cluster (M0 free tier)
4. Create user and password
5. Whitelist IP address (0.0.0.0/0 for development)
6. Get connection string
7. Add to `.env`:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ecommerce-app
   ```

### First Time Setup

1. **Backend configuration:**
   ```bash
   cd backend
   cp .env.example .env
   ```

2. **Edit backend/.env:**
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/ecommerce-app
   JWT_SECRET=your_secret_key_here
   JWT_EXPIRE=7d
   NODE_ENV=development
   FRONTEND_URL=http://localhost:3000
   ```

3. **Frontend configuration:**
   ```bash
   cd frontend
   echo "REACT_APP_API_URL=http://localhost:5000/api" > .env.local
   ```

4. **Install dependencies:**
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```

5. **Start development:**
   ```bash
   # Terminal 1
   cd backend && npm run dev
   
   # Terminal 2
   cd frontend && npm start
   ```

---

## Customization

### 1. Change App Name

#### Frontend

**File: `frontend/src/components/Header.js`**
```javascript
// Find this line:
<h1>📦 E-Shop</h1>

// Change to:
<h1>🛍️ My Store Name</h1>
```

**File: `frontend/public/index.html`**
```html
<!-- Change from: -->
<title>E-Commerce App</title>

<!-- To: -->
<title>My Store Name</title>
```

**File: `frontend/package.json`**
```json
{
  "name": "my-ecommerce-app"
}
```

#### Backend

**File: `backend/package.json`**
```json
{
  "name": "my-ecommerce-api"
}
```

### 2. Change Colors & Theme

Update all occurrences in `frontend/src/styles/`:

| Color | Code | Use Case |
|-------|------|----------|
| Primary | `#ff9900` | Buttons, Header, Links |
| Secondary | `#132f4c` | Background, Footer |
| Success | `#4caf50` | Success messages |
| Error | `#d32f2f` | Errors, Warnings |

**File: `frontend/src/styles/Header.css`**
```css
/* Change primary color */
.header {
  background-color: #132f4c; /* Change this */
}

/* Change button color */
.search-bar button {
  background-color: #ff9900; /* Change this */
}
```

**Quick Replace in All CSS:**
1. Ctrl+Shift+H (Find & Replace in VS Code)
2. Find: `#ff9900`
3. Replace with: `#your_color`

### 3. Change Logo

**File: `frontend/src/components/Header.js`**
```javascript
// Change emoji and text:
<h1>📦 E-Shop</h1>

// To your preference:
<h1>🏬 Your Store</h1>
<h1>🛒 Shop Now</h1>
<h1>🎁 Gift Store</h1>
```

### 4. Add New Features

#### Add Product Category

**File: `backend/models/Product.js`**
```javascript
category: {
  type: String,
  enum: [
    'Electronics',
    'Clothing',
    'Books',
    'Home & Kitchen',
    'Sports',
    'Beauty',
    'Toys',
    'Groceries',
    'Your New Category', // Add here
    'Other'
  ]
}
```

**File: `frontend/src/components/Header.js`**
```javascript
<Link to="/?category=Your New Category">New Category</Link>
```

#### Add Payment Method

**File: `backend/models/Order.js`**
```javascript
paymentMethod: {
  type: String,
  enum: ['credit-card', 'debit-card', 'upi', 'cod', 'your_method']
}
```

---

## Deployment

### Step 1: Prepare for Production

#### Backend (`backend/.env.production`)
```
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/ecommerce
JWT_SECRET=generate_new_secure_key
JWT_EXPIRE=7d
FRONTEND_URL=https://your-domain.com
```

#### Frontend (`frontend/.env.production`)
```
REACT_APP_API_URL=https://your-backend-domain/api
```

### Step 2: Deploy Backend (Render.com - Recommended)

1. **Sign up:** https://render.com
2. **Connect GitHub:** Link your repository
3. **Create Web Service:**
   - Select repository
   - Set environment to `Node`
   - Add environment variables from `.env.production`
   - Deploy

**Backend URL:** `https://your-app-name.onrender.com`

### Step 3: Deploy Frontend (Vercel - Recommended)

1. **Sign up:** https://vercel.com
2. **Import project:**
   - Select repository
   - Select `frontend` folder
3. **Add environment variables:**
   ```
   REACT_APP_API_URL=https://your-app-name.onrender.com/api
   ```
4. **Deploy**

**Frontend URL:** `https://your-domain.vercel.app`

### Step 4: Setup MongoDB Atlas

1. **Sign up:** https://www.mongodb.com/cloud/atlas
2. **Create free cluster (M0)**
3. **Add user with password**
4. **Whitelist IP (0.0.0.0/0)**
5. **Get connection string**
6. **Update backend `.env`**

### Step 5: Update CORS

**File: `backend/server.js`**
```javascript
const corsOptions = {
  origin: [
    'https://your-frontend-domain.com',
    'https://your-domain.vercel.app',
    'http://localhost:3000'
  ],
  credentials: true
};

app.use(cors(corsOptions));
```

### Deployment Checklist

- [ ] MongoDB Atlas setup
- [ ] Backend deployed on Render
- [ ] Frontend deployed on Vercel
- [ ] Environment variables set
- [ ] CORS configured
- [ ] Test all features
- [ ] Monitor logs

---

## Troubleshooting

### MongoDB Connection Error

**Error:** `MongoError: connect ECONNREFUSED 127.0.0.1:27017`

**Solution:**
```bash
# Windows
mongod  # Run in new terminal

# Mac
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Or use MongoDB Atlas (recommended)
# Connection string in .env: mongodb+srv://user:pass@cluster.mongodb.net/db
```

### Port Already in Use

**Error:** `Error: listen EADDRINUSE :::5000`

**Solution:**
```bash
# Windows - Kill process on port 5000
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :5000
kill -9 <PID>

# Or change port in .env
PORT=5001
```

### Frontend Can't Connect to Backend

**Error:** `Error: Network request failed`

**Solution:**
1. **Check backend is running:**
   ```bash
   curl http://localhost:5000/api/health
   ```

2. **Verify API URL in frontend:**
   ```
   frontend/.env.local
   REACT_APP_API_URL=http://localhost:5000/api
   ```

3. **Check CORS in backend:**
   ```javascript
   // backend/server.js
   origin: 'http://localhost:3000'
   ```

### npm install Issues

**Error:** `npm ERR! code ERESOLVE`

**Solution:**
```bash
npm install --legacy-peer-deps
# Or update npm
npm install -g npm@latest
npm install
```

### Node Modules Too Large

**Solution:**
```bash
# Delete and reinstall
rm -rf node_modules package-lock.json
npm install --omit=dev  # For production
```

### Git Commit Issues

**Error:** `.env` file exposed

**Solution:**
```bash
# Remove .env from git tracking
git rm --cached .env
git commit -m "Remove .env"

# Make sure .gitignore has .env
```

### Black Screen on Frontend

**Solution:**
1. Clear browser cache: `Ctrl+Shift+Delete`
2. Check console: `F12 → Console`
3. Restart frontend: `npm start`

### Database Data Lost

**Prevention:**
```bash
# Backup before major changes
mongoexport --db ecommerce-app --collection products --out backup.json

# Restore if needed
mongoimport --db ecommerce-app --collection products backup.json
```

---

## Performance Optimization

### Frontend

```bash
# Build for production
cd frontend
npm run build

# Analyze bundle size
npm install -D webpack-bundle-analyzer
```

### Backend

1. **Add indexes to MongoDB:**
```javascript
// models/Product.js
productSchema.index({ category: 1 });
productSchema.index({ name: 'text' });
```

2. **Enable compression:**
```javascript
const compression = require('compression');
app.use(compression());
```

---

## Security Tips

1. **Never commit `.env` files**
2. **Use strong JWT secret** (generate with `openssl rand -base64 32`)
3. **Enable HTTPS** (automatic on Vercel/Render)
4. **Update dependencies:** `npm audit fix`
5. **Validate all inputs**
6. **Use environment variables** for sensitive data

---

## Useful Commands

```bash
# Development
npm run dev          # Run both frontend & backend
npm run backend      # Backend only
npm run frontend     # Frontend only

# Production
npm run build        # Build frontend
npm start           # Production start

# Database
mongod              # Start MongoDB
mongo               # Open MongoDB shell

# Git
git add .
git commit -m "message"
git push origin main
```

---

## Resources

- **Documentation:** See `README.md`
- **Quick Start:** See `QUICKSTART.md`
- **Configuration:** See `CONFIG.md`
- **Project Summary:** See `PROJECT_SUMMARY.md`

---

## Support Channels

1. Check existing documentation
2. Review error messages in console
3. Check MongoDB connection
4. Verify environment variables
5. Test API with Postman

---

**Your project is ready! 🚀**

Start with: `QUICKSTART.md`
Deploy with: `DEPLOYMENT.md`
