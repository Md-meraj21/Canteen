# Deployment Guide

## Live Deployment Steps

### Step 1: Prepare Backend

1. **Optimize code:**
   - Remove console.logs for production
   - Add error logging
   - Implement rate limiting

2. **Set environment variables:**
   - Update `.env` with production values
   - Use strong JWT secret
   - Use production MongoDB

3. **Deploy to Render (Free)**
   - Sign up at https://render.com
   - Connect GitHub repository
   - Create new Web Service
   - Set environment variables
   - Deploy

**Or Deploy to Heroku:**
   ```bash
   heroku create your-app-name
   heroku config:set JWT_SECRET=your_secret
   git push heroku main
   ```

**Backend URL:** `https://your-app-name.onrender.com`

### Step 2: Prepare Frontend

1. **Update API URL:**
   ```
   REACT_APP_API_URL=https://your-app-name.onrender.com/api
   ```

2. **Build for production:**
   ```bash
   cd frontend
   npm run build
   ```

3. **Deploy to Vercel (Recommended)**
   - Sign up at https://vercel.com
   - Import GitHub repository
   - Set `REACT_APP_API_URL` in environment variables
   - Deploy

**Or Deploy to Netlify:**
   - Sign up at https://netlify.com
   - Drag & drop `build` folder
   - Configure redirects (create `_redirects` file)

**Frontend URL:** `https://your-domain.vercel.app`

### Step 3: Update Configuration

1. Update CORS in `backend/server.js`:
```javascript
const corsOptions = {
  origin: ['https://your-frontend-domain.com', 'https://your-domain.vercel.app'],
  credentials: true
};
```

2. Update frontend API URL to production backend

### Step 4: Database Migration

1. **Backup existing data** (if any)
2. **Export data:**
   ```bash
   mongoexport --db ecommerce-app --collection products --out products.json
   ```

3. **Import to production:**
   ```bash
   mongoimport --uri "mongodb+srv://user:pass@cluster.mongodb.net/ecommerce-app" --collection products --file products.json
   ```

### Step 5: Testing

1. Test all features on production
2. Test payment flow
3. Test user authentication
4. Monitor error logs

## Changing App Name for Deployment

### Frontend Changes

1. **Update `frontend/package.json`:**
```json
{
  "name": "my-ecommerce-app",
  "homepage": "https://my-ecommerce-app.vercel.app"
}
```

2. **Update `frontend/public/index.html`:**
```html
<title>My E-Commerce App</title>
```

3. **Update logo in `frontend/src/components/Header.js`:**
```javascript
<h1>🛍️ My Store Name</h1>
```

### Backend Changes

1. **Update `backend/package.json`:**
```json
{
  "name": "my-ecommerce-api"
}
```

2. **Update CORS origin:**
```javascript
origin: ['https://my-ecommerce-app.vercel.app']
```

## SSL/HTTPS

Both Vercel and Render automatically provide SSL certificates. No additional setup needed.

## Custom Domain

### Frontend (Vercel)
1. Go to Settings → Domains
2. Add custom domain
3. Update DNS records
4. Verify

### Backend (Render)
1. Go to Environment → Custom Domain
2. Add custom domain
3. Update DNS records

## Continuous Deployment

Both Vercel and Render support automatic deployment on Git push.

### Configure:
1. Connect repository
2. Set environment variables
3. Enable auto-deploy on push

## Monitoring

### Backend (Render)
- View logs in dashboard
- Monitor CPU/memory usage
- Set up alerts

### Frontend (Vercel)
- View deployment logs
- Monitor analytics
- Check Core Web Vitals

## Scaling

### Increase Backend Resources
1. Upgrade plan on Render (from $7/month)
2. Enable auto-scaling if available

### Database Optimization
1. Add MongoDB indexes
2. Optimize queries
3. Enable caching

## Backup Strategy

1. **Daily MongoDB Backups:**
   - Enable in MongoDB Atlas settings
   - Or use third-party backup service

2. **Code Backups:**
   - Maintain Git repository
   - Tag releases

## Cost Estimation

- **Free Tier:**
  - Vercel Frontend: Free
  - Render Backend: Free (sleep after 15 min inactivity)
  - MongoDB Atlas: Free (512MB)
  - Total: $0/month

- **Paid Tier:**
  - Vercel: $20/month (Pro)
  - Render: $7-25/month (Standard)
  - MongoDB: $9-45/month
  - **Total: $36-90/month**

## Post-Deployment Checklist

- [ ] Test all pages load correctly
- [ ] Test user registration & login
- [ ] Test product browsing & search
- [ ] Test add to cart & checkout
- [ ] Test order placement
- [ ] Verify error messages display
- [ ] Check console for errors
- [ ] Test on mobile devices
- [ ] Check site speed
- [ ] Monitor error logs
- [ ] Set up email notifications (optional)
- [ ] Enable analytics

---

**Your app is now live! 🎉**
