# 🚀 Admin Verification System - Quick Start Testing

## Phase 1: Database Setup ✅

### 1. Add Test Military User to Database
```bash
cd backend
node scripts/seedMilitaryUser.js
```

**Expected Output:**
```
✅ Test military user created successfully!

User Details:
  Email: captain.rajesh@military.com
  Password: test123456
  Name: Capt. Rajesh Kumar
  Rank: Captain
  Military ID: IND-MA-45-2024
  Verification Status: pending

Next Steps:
  1. Login as admin...
```

---

## Phase 2: Frontend Testing ✅

### 2. Start Frontend Server
```bash
cd frontend
npm start
```

Should open http://localhost:3000 automatically.

### 3. Test Registration (Optional - if you want to register a new user)

**Go to:** http://localhost:3000/register

Fill form:
```
Name: Maj. Vikram Singh
Email: major.vikram@military.com
Phone: 9876543211
Password: test123
Rank: Major
Military ID: IND-MA-46-2024
ID Card: Upload any image
```

Click "Register"

**Expected:**
- ✅ Success page shows "Account Created ✅"
- ✅ Shows "Admin Verification ⏳" with pulsing animation
- ✅ Shows countdown "Estimated: 24-48 hours"
- ✅ localStorage has 'pendingRegistrationEmail' = major.vikram@military.com

### 4. Verify localStorage Persistence
```javascript
// Open Console (F12) and run:
localStorage.getItem('pendingRegistrationEmail')
// Output: "major.vikram@military.com"

// Refresh page (Ctrl+R) - page should still show verification page
// Navigate to http://localhost:3000/register - should show verification page
```

---

## Phase 3: Admin Dashboard Testing ⭐ (CRITICAL)

### 5. Login as Admin

**Go to:** http://localhost:3000/login

Credentials:
```
Email: seller@shopkaro.com
Password: seller123
```

**Expected:**
- ✅ Login successful
- ✅ Redirects to /admin/dashboard
- ✅ Header shows "🎖️ Verify" button
- ✅ localStorage has 'token' = JWT token

### 6. Verify JWT Token in Browser Console
```javascript
// Run in Console:
const token = localStorage.getItem('token');
console.log(token);
// Should print: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

// To decode (go to jwt.io and paste token):
// Payload should contain:
{
  "id": "...",
  "email": "seller@shopkaro.com",
  "iat": 1234567890,
  "exp": 1234567890
}
```

### 7. Click "🎖️ Verify" Button

**Expected:**
- ✅ Navigation to /admin/verification page
- ✅ Page header: "🎖️ सैनिक सत्यापन डैशबोर्ड"
- ✅ Filter buttons visible: [📋 Pending] [✅ Verified] [❌ Rejected]
- ✅ Loading spinner appears briefly
- ✅ "Capt. Rajesh Kumar" appears in pending list

### 8. Verify Console Shows API Response

Open Console (F12 → Console tab):
```
Users fetched: [
  {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Capt. Rajesh Kumar",
    "email": "captain.rajesh@military.com",
    "militaryId": "IND-MA-45-2024",
    "rank": "Captain",
    "idCardImage": "data:image/jpeg;base64/...",
    "verificationStatus": "pending",
    "phone": "9876543210"
  }
]
```

### 9. Verify Image Displays

- ✅ ID Card image displays in user card
- ✅ Image shows soldier's photo (test image)
- ✅ Image has label: "ID Card Image"

### 10. Test Approval Process

**In the Capt. Rajesh Kumar card:**

1. Click notes textarea
2. Type: "✅ Military ID verified. Documents complete."
3. Click "✅ Approve & Verify" button

**Expected:**
- ✅ Console shows: `Verifying user: ... Approved: true`
- ✅ User card status changes from "⏳ PENDING" to "✅ VERIFIED"
- ✅ Alert shows: "✅ User Verified!"
- ✅ Notes field disappears
- ✅ Verified date appears: "Verified on: DD/MM/YYYY"

### 11. Verify Database Update

```bash
# In another terminal, use MongoDB Compass or shell:
mongosh
use shop-karo
db.users.findOne({ email: "captain.rajesh@military.com" })

# Expected output:
{
  "_id": ObjectId("..."),
  "name": "Capt. Rajesh Kumar",
  "email": "captain.rajesh@military.com",
  "militaryId": "IND-MA-45-2024",
  "rank": "Captain",
  "verificationStatus": "verified",     // ← Changed!
  "verifiedBy": ObjectId("..."),        // ← Admin ID
  "verifiedAt": ISODate("2024-..."),   // ← Timestamp
  "verificationNotes": "✅ Military ID verified. Documents complete."
}
```

### 12. Test Filter: Click "✅ Verified"

- ✅ Page shows only verified users
- ✅ "Capt. Rajesh Kumar" still visible with "✅ VERIFIED" status
- ✅ No pending users shown

### 13. Test Filter: Click "❌ Rejected"

- ✅ Page shows only rejected users
- ✅ Empty list (no rejections yet)

---

## Phase 4: Verified User Login Test ⭐

### 14. Logout from Admin

Click logout button (usually top-right)

### 15. Login as Verified Military User

**Go to:** http://localhost:3000/login

Credentials:
```
Email: captain.rajesh@military.com
Password: test123456
```

**Expected:**
- ✅ Login successful
- ✅ Redirects to home page or dashboard
- ✅ Can browse products
- ✅ Can add to cart
- ✅ Can checkout

### 16. Test Rejection Flow (Optional)

1. Register another military user (different email)
2. Login as admin
3. Click 🎖️ Verify
4. Click "❌ Reject & Block" on pending user
5. Add rejection notes: "❌ ID card not legible. Please resubmit."
6. Verify user status changes to "❌ REJECTED"
7. Rejected user should NOT be able to login

---

## Phase 5: Edge Case Testing 🧪

### 17. Test Page Persistence (localStorage)

```javascript
// After registering a military user:
// 1. Open Console and run:
localStorage.getItem('pendingRegistrationEmail')

// 2. Clear localStorage:
localStorage.removeItem('pendingRegistrationEmail')

// 3. Navigate back to /verification-pending
// Expected: Page shows "Something went wrong" or redirects to home

// 4. Re-register and test persistence
localStorage.setItem('pendingRegistrationEmail', 'test@military.com')
// Navigate to /register - should show VerificationPending
```

### 18. Test without JWT Token

```javascript
// In Console:
localStorage.removeItem('token')

// Try to click 🎖️ Verify
// Expected: Error message "Only admin can access this" or redirect to login
```

### 19. Test with Wrong Admin Email

```javascript
// Edit User model temporarily to use different email check
// Expected: 403 Forbidden error
```

---

## 🎯 Success Criteria

All of the following should be TRUE:

- [ ] Test military user created successfully
- [ ] Admin can login with seller@shopkaro.com
- [ ] Admin can navigate to /admin/verification page
- [ ] Pending users list loads from API
- [ ] ID card image displays correctly
- [ ] Admin can approve users (status updates to verified)
- [ ] Database updates correctly (verificationStatus, verifiedBy, verifiedAt)
- [ ] Filter buttons work (pending/verified/rejected)
- [ ] Verified user can login normally
- [ ] Verified user can access shop features
- [ ] localStorage persistence works across refreshes
- [ ] Route protection works (/register shows VerificationPending if email in localStorage)
- [ ] No console errors during entire flow
- [ ] No 401/403 errors in network tab

---

## 🐛 Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| "Only admin can access this" | Admin email not 'seller@shopkaro.com' | Check JWT token payload at jwt.io |
| Empty pending users list | No users in 'pending' status | Run seedMilitaryUser.js or register new user |
| Image not displaying | idCardImage is null or invalid | Check base64 string in database |
| API returning 401 | No/Invalid JWT token | Check localStorage token, verify authMiddleware |
| API returning 404 | Route not found | Verify backend routes in userRoutes.js |
| "Cannot read property 'getPendingUsers'" | usersAPI not properly exported | Check api.js exports |
| Page disappears on refresh | localStorage not persisting | Check browser localStorage settings |

---

## 📞 Quick Troubleshooting Commands

### Check Backend Logs
```bash
# Terminal where backend is running
# Should show:
GET /api/users/pending/pending 200
PUT /api/users/verify/507f1f77bcf86cd799439011 200
```

### Check Network Tab
```
Open DevTools → Network tab
Filter for "pending" or "verify"
Check:
- Status: 200 (success)
- Headers: Authorization: Bearer eyJ...
- Response: Should show user objects
```

### Check Database State
```bash
# Quick check in MongoDB:
db.users.countDocuments({ verificationStatus: "pending" })
db.users.countDocuments({ verificationStatus: "verified" })
db.users.countDocuments({ verificationStatus: "rejected" })
```

---

## ✅ Completion Checklist

After all tests pass:

1. [ ] Create GitHub issue: "Admin verification system tested and working"
2. [ ] Document any bugs found
3. [ ] Commit changes to version control
4. [ ] Update deployment checklist
5. [ ] Notify team about verified feature
6. [ ] Plan for email notification feature (next phase)

---

**Total Estimated Time:** 20-30 minutes for full testing cycle

**Success Rate:** > 95% if all prerequisites are met

Good luck! 🚀
