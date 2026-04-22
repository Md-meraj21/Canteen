# 🎖️ Admin Verification System - Testing & Debugging Guide

## Current Status
✅ Frontend API methods implemented
✅ Backend routes created
✅ Database models updated
✅ JWT authentication configured
🔍 **TESTING PHASE** - Need to verify end-to-end flow

---

## Step 1: Test Registration Flow

### 1.1 Register New Military User
```
URL: http://localhost:3000/register
Email: testmilitary@example.com
Password: test123
Name: Test Officer
Phone: 9876543210
Military ID: IND-45-2024
Rank: Lieutenant
ID Card Image: Upload any image (will be compressed)
```

**Expected:**
- ✅ Registration successful message
- ✅ Page persists at /verification-pending
- ✅ Shows "Account Created" ✅ (completed)
- ✅ Shows "Admin Verification" ⏳ (in progress, pulsing)
- ✅ Shows "Ready to Login" (pending)
- ✅ localStorage has key: `pendingRegistrationEmail`

### 1.2 Verify Registration in Database
```bash
# SSH to MongoDB or use MongoDB Compass
db.users.findOne({ email: "testmilitary@example.com" })

# Should show:
{
  name: "Test Officer",
  email: "testmilitary@example.com",
  militaryId: "IND-45-2024",
  rank: "Lieutenant",
  verificationStatus: "pending",    // ← CRITICAL
  idCardImage: "data:image/jpeg..." // ← Base64 encoded
}
```

---

## Step 2: Test Admin Login

### 2.1 Login as Admin
```
URL: http://localhost:3000/login
Email: seller@shopkaro.com
Password: seller123
```

**Expected:**
- ✅ Login successful
- ✅ Redirects to /admin/dashboard
- ✅ Header shows "🎖️ Verify" button

### 2.2 Verify JWT Token
```javascript
// Open browser console & run:
console.log(localStorage.getItem('token'));
// Should print a long JWT token starting with "eyJ..."
```

---

## Step 3: Test Admin Verification Dashboard

### 3.1 Access Verification Page
```
1. Click "🎖️ Verify" button in header
2. Should navigate to /admin/verification
```

**Expected:**
- ✅ Page loads without errors
- ✅ Heading: "🎖️ सैनिक सत्यापन डैशबोर्ड"
- ✅ Filter buttons: [📋 Pending] [✅ Verified] [❌ Rejected]
- ✅ Shows loading state while fetching
- ✅ Displays list of pending users

### 3.2 Debug Console Output
Open browser DevTools → Console tab
Should see:
```
Users fetched: [
  {
    _id: "...",
    name: "Test Officer",
    email: "testmilitary@example.com",
    militaryId: "IND-45-2024",
    rank: "Lieutenant",
    idCardImage: "data:image/jpeg...",
    verificationStatus: "pending"
  }
]
```

---

## Step 4: Test Verification Action

### 4.1 Approve User
```
1. Find "Test Officer" in pending list
2. (Optional) Add notes: "Documents verified ✓"
3. Click "✅ Approve & Verify" button
```

**Expected:**
- ✅ Console shows: "Verifying user: ... Approved: true"
- ✅ User card status changes to "✅ VERIFIED"
- ✅ Notes field disappears
- ✅ Alert: "✅ User Verified!"

### 4.2 Verify in Database
```bash
db.users.findOne({ email: "testmilitary@example.com" })

# Should show:
{
  verificationStatus: "verified",  // ← Changed from "pending"
  verifiedBy: ObjectId("..."),     // ← Admin's ID
  verifiedAt: ISODate("2024-...") // ← Timestamp
}
```

---

## Step 5: Test User Login After Verification

### 5.1 Logout & Login as Verified User
```
1. Logout from admin (click logout button)
2. Go to /login
3. Email: testmilitary@example.com
4. Password: test123
```

**Expected:**
- ✅ Login successful
- ✅ Redirects to /dashboard or home
- ✅ Can access shop features

---

## 🐛 Troubleshooting

### Issue 1: "Only admin can access this" Error
**Cause:** Admin email check failing
**Solution:**
```javascript
// Check in browser console
console.log(localStorage.getItem('token'));

// Decode JWT to verify email
// Go to https://jwt.io and paste token
// Check payload.email === 'seller@shopkaro.com'
```

### Issue 2: "Cannot read property 'getPendingUsers' of undefined"
**Cause:** usersAPI not exported properly
**Solution:**
```javascript
// Check api.js
// Verify usersAPI is exported as named export:
export const usersAPI = { ... }

// Check VerificationDashboard import:
import { usersAPI } from '../services/api';
```

### Issue 3: Empty Pending Users List
**Possible Causes:**
1. No pending users in database
   - Solution: Register new military user and check database
2. API returning error
   - Solution: Check browser console for error message
3. Database connection issue
   - Solution: Check backend logs and MongoDB connection

### Issue 4: Image Not Displaying in Admin Dashboard
**Cause:** Base64 string not properly formatted
**Solution:**
```javascript
// In VerificationDashboard.js, verify image rendering
{user.idCardImage && (
  <div className="id-card-image">
    <img src={user.idCardImage} alt="ID Card" />
  </div>
)}

// Check if idCardImage starts with "data:image/"
console.log(user.idCardImage.substring(0, 50));
```

---

## 📋 API Endpoint Testing (Curl Commands)

### Test Get Pending Users
```bash
curl -X GET http://localhost:5000/api/users/pending/pending \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"

# Response should be:
[
  {
    "_id": "...",
    "name": "Test Officer",
    "email": "testmilitary@example.com",
    "verificationStatus": "pending"
  }
]
```

### Test Verify User
```bash
curl -X PUT http://localhost:5000/api/users/verify/USER_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "approved": true,
    "verificationNotes": "Documents verified"
  }'

# Response should be updated user object with verificationStatus: "verified"
```

---

## ✅ Success Checklist

After testing, verify all items are complete:

- [ ] Military user can register with ID card image
- [ ] Registration success page persists (localStorage working)
- [ ] Admin can login with seller@shopkaro.com
- [ ] Admin can access /admin/verification page
- [ ] Pending users list loads from database
- [ ] ID card image displays in admin dashboard
- [ ] Admin can see user details (name, email, militaryId, rank)
- [ ] Admin can add notes and approve user
- [ ] Verification status updates in database to "verified"
- [ ] Verified user can login normally
- [ ] Admin can see verified users when clicking "✅ Verified" filter
- [ ] Admin can reject users with rejection notes
- [ ] No console errors during verification process

---

## 📊 Database Verification

### Check All Military Users
```bash
db.users.find({ militaryId: { $exists: true } }).pretty()
```

### Check Verification Status Distribution
```bash
db.users.aggregate([
  { $match: { militaryId: { $exists: true } } },
  { $group: { _id: "$verificationStatus", count: { $sum: 1 } } }
])

# Expected output:
{ "_id": "pending", "count": 2 }
{ "_id": "verified", "count": 1 }
{ "_id": "rejected", "count": 0 }
```

---

## 🔄 Next Steps After Testing

1. **If all tests pass:**
   - Move to production
   - Add email notifications when verified/rejected
   - Add SMS notifications (optional)

2. **If issues found:**
   - Check console errors in browser
   - Check backend server logs
   - Verify database connectivity
   - Check JWT token validity

3. **Optional enhancements:**
   - Add batch verification (select multiple users)
   - Add verification history/audit log
   - Add PDF export of verified users
   - Add email template customization
   - Add verification deadline (auto-reject after 30 days)

---

## 📞 Support

If you encounter issues:
1. Check console (F12 → Console tab)
2. Check backend logs (terminal where `npm start` is running)
3. Verify database (MongoDB Compass or shell)
4. Check JWT token (https://jwt.io)
5. Verify admin email in database (seller@shopkaro.com)
