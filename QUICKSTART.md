# Quick Start Guide

## 5 मिनट में शुरू करें 🚀

### Step 1: Backend Setup (2 minutes)

```bash
cd backend
npm install
```

अब `.env` file बनाएं:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ecommerce-app
JWT_SECRET=your_secret_key_123
JWT_EXPIRE=7d
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

Backend शुरू करें:
```bash
npm run dev
```

✅ Backend चल गया: http://localhost:5000

### Step 2: Frontend Setup (2 minutes)

नई terminal खोलें:
```bash
cd frontend
npm install
```

Frontend शुरू करें:
```bash
npm start
```

✅ Frontend खुल गया: http://localhost:3000

### Step 3: Test करें (1 minute)

1. Homepage देखें - यह काम करना चाहिए
2. Register पर क्लिक करें - एक account बनाएं
3. Login करें
4. Products देखें
5. Cart में add करें
6. Checkout करें

## Important Notes

### MongoDB चलाना

**अगर MongoDB installed है:**
```bash
mongod
```

**अगर MongoDB नहीं है:**
1. Download करें: https://www.mongodb.com/try/download/community
2. Install करें
3. Run करें: `mongod`

**या MongoDB Atlas use करें (Cloud):**
1. https://www.mongodb.com/cloud/atlas पर जाएं
2. Free account बनाएं
3. Connection string copy करें
4. `.env` में update करें:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ecommerce
   ```

## App Name Change करें

### Frontend में:
1. `frontend/src/components/Header.js` खोलें
2. `<h1>📦 E-Shop</h1>` को अपना नाम से replace करें
3. `frontend/public/index.html` में भी `<title>` change करें

### Backend में:
1. `backend/package.json` में `"name"` field update करें

## Color Theme Change करें

1. `frontend/src/styles/Header.css` खोलें
2. `#ff9900` को अपना color से replace करें (सभी CSS files में)
3. `#132f4c` को secondary color से replace करें

## Deploy करने के लिए

पूरी guide देखें: [DEPLOYMENT.md](DEPLOYMENT.md)

Quick steps:
1. GitHub पर push करें
2. Vercel पर frontend deploy करें
3. Render पर backend deploy करें
4. MongoDB Atlas use करें database के लिए

## Error Fix करें

### MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Fix:** MongoDB को run करें
```bash
mongod
```

### Port 5000 or 3000 already in use
```bash
# Port 5000 को kill करें
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Port 3000 को kill करें
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Frontend API error
**Fix:** Backend का URL सही है देखें
```
frontend/.env.local में:
REACT_APP_API_URL=http://localhost:5000/api
```

## Key Features

✅ User Registration & Login
✅ Product Browse & Search
✅ Shopping Cart
✅ Checkout Process
✅ Order Management
✅ User Profile
✅ Product Reviews
✅ Category Filtering
✅ Responsive Design
✅ Production Ready

## Next Steps

1. **Products add करें** - Admin panel बनाकर
2. **Payment Gateway** - Stripe/Razorpay integrate करें
3. **Email Notifications** - Order confirmation emails
4. **Dashboard** - Admin analytics
5. **Mobile App** - React Native version

## Files Guide

```
backend/
├── models/          ← Database models
├── routes/          ← API endpoints
├── middleware/      ← Auth & validation
├── server.js        ← Main server file
└── .env             ← Configuration

frontend/
├── src/pages/       ← Pages (Home, Cart, etc)
├── src/components/  ← Components (Header, Footer)
├── src/styles/      ← CSS files
└── public/          ← Static files
```

## Support

अगर कोई issue है तो:
1. README.md पढ़ें
2. DEPLOYMENT.md देखें
3. GitHub issue बनाएं

---

**Happy Coding! आपका e-commerce app ready है! 🎉**
