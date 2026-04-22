#!/bin/bash

# 🎖️ Admin Verification API Test Script
# This script tests all verification API endpoints

echo "================================"
echo "🎖️ Verification System API Tests"
echo "================================"
echo ""

# Configuration
API_URL="http://localhost:5000/api"
ADMIN_EMAIL="seller@shopkaro.com"
ADMIN_PASSWORD="seller123"

echo "📍 Step 1: Getting Admin JWT Token..."
echo "---"

# Login to get token
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$ADMIN_EMAIL\",
    \"password\": \"$ADMIN_PASSWORD\"
  }")

echo "Response: $LOGIN_RESPONSE"
echo ""

# Extract token
TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ Failed to get token! Exiting."
  exit 1
fi

echo "✅ Token obtained: ${TOKEN:0:20}..."
echo ""

echo "📍 Step 2: Fetching Pending Users..."
echo "---"

PENDING_RESPONSE=$(curl -s -X GET "$API_URL/users/pending/pending" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")

echo "Response: $PENDING_RESPONSE"
echo ""

# Check if we got pending users
if echo "$PENDING_RESPONSE" | grep -q "_id"; then
  echo "✅ Pending users found!"
  
  # Extract first user ID
  USER_ID=$(echo $PENDING_RESPONSE | grep -o '"_id":"[^"]*' | head -1 | cut -d'"' -f4)
  echo "   User ID: $USER_ID"
  echo ""
  
  echo "📍 Step 3: Verifying User..."
  echo "---"
  
  VERIFY_RESPONSE=$(curl -s -X PUT "$API_URL/users/verify/$USER_ID" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "approved": true,
      "verificationNotes": "Documents verified via script"
    }')
  
  echo "Response: $VERIFY_RESPONSE"
  echo ""
  
  if echo "$VERIFY_RESPONSE" | grep -q "verified"; then
    echo "✅ User verification successful!"
  else
    echo "⚠️  Check response above"
  fi
else
  echo "⚠️ No pending users found"
  echo "   (Register a military user first)"
fi

echo ""
echo "📍 Step 4: Fetching Verified Users..."
echo "---"

VERIFIED_RESPONSE=$(curl -s -X GET "$API_URL/users/pending/verified" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")

echo "Response: $VERIFIED_RESPONSE"
echo ""

if echo "$VERIFIED_RESPONSE" | grep -q "_id"; then
  echo "✅ Verified users found!"
else
  echo "⚠️ No verified users found yet"
fi

echo "================================"
echo "✅ Test Complete!"
echo "================================"
