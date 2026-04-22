# Environment Configuration Guide

## Backend Environment Variables (.env)

```
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/ecommerce-app

# Authentication
JWT_SECRET=your_jwt_secret_key_change_in_production
JWT_EXPIRE=7d

# Email (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Payment Gateway (Optional)
STRIPE_API_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_public_key

# Image Upload (Optional)
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Admin Configuration
ADMIN_EMAIL=admin@ecommerce.com
ADMIN_PASSWORD=admin123
```

## Frontend Environment Variables (.env.local)

```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_ENVIRONMENT=development
```

## Production Setup

### Backend Production (.env.production)

```
PORT=5000
NODE_ENV=production

# Production MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ecommerce

# Secure JWT Secret (Generate: openssl rand -base64 32)
JWT_SECRET=your_generated_secure_key_here
JWT_EXPIRE=7d

# Production Frontend URL
FRONTEND_URL=https://yourdomain.com

# Stripe (Production Keys)
STRIPE_API_KEY=pk_live_your_live_key
STRIPE_PUBLISHABLE_KEY=pk_live_your_publishable_key
```

### Frontend Production (.env.production)

```
REACT_APP_API_URL=https://yourdomain.com/api
REACT_APP_ENVIRONMENT=production
```

## Generating Secure JWT Secret

```bash
# On Mac/Linux
openssl rand -base64 32

# On Windows (PowerShell)
[Convert]::ToBase64String((1..32 | ForEach-Object {[byte](Get-Random -Maximum 256)}))
```

## MongoDB Atlas Setup

1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create cluster (M0 free tier)
4. Create database user
5. Add IP whitelist (allow all: 0.0.0.0/0)
6. Get connection string
7. Format: `mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority`

## Stripe Setup

1. Sign up at https://stripe.com
2. Go to Dashboard
3. Get API keys from Settings → API Keys
4. Use "Restricted keys" for security
5. Update `.env` with keys

## Cloudinary Setup (Optional Image Upload)

1. Sign up at https://cloudinary.com
2. Go to Dashboard
3. Copy Cloud Name, API Key, API Secret
4. Update `.env` with credentials

## Email Configuration

### Gmail Setup
1. Enable 2-factor authentication
2. Generate App Password
3. Use App Password in SMTP_PASS
4. Update `SMTP_USER` with Gmail address

## Security Best Practices

- Never commit `.env` files to Git
- Use `.env.example` as template
- Regenerate JWT_SECRET for production
- Use strong database passwords
- Keep API keys confidential
- Enable HTTPS in production
- Use environment-specific configurations
