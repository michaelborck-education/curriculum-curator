#!/bin/bash

# Test script to verify unit creation works on backend

BASE_URL="https://curriculumcurator.serveur.au"

# Step 1: Login
echo "=== Logging in ==="
LOGIN_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "michael.borck@curtin.edu.au", "password": "your-password-here"}')

echo "Login response: $LOGIN_RESPONSE"

# Extract token
TOKEN=$(echo $LOGIN_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin)['access_token'])" 2>/dev/null)

if [ -z "$TOKEN" ]; then
  echo "ERROR: Failed to get token"
  exit 1
fi

echo "Got token: ${TOKEN:0:20}..."
echo ""

# Step 2: Test GET /api/units (should work)
echo "=== Testing GET /api/units ==="
GET_RESPONSE=$(curl -s -X GET "${BASE_URL}/api/units" \
  -H "Authorization: Bearer $TOKEN")
echo "GET response: $GET_RESPONSE"
echo ""

# Step 3: Test POST /api/units/create (the failing one)
echo "=== Testing POST /api/units/create ==="
POST_RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X POST "${BASE_URL}/api/units/create" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Unit",
    "code": "TEST101",
    "description": "Test unit from curl",
    "year": 2025,
    "semester": "semester_1",
    "pedagogyType": "inquiry_based",
    "difficultyLevel": "intermediate",
    "durationWeeks": 12,
    "creditPoints": 6,
    "prerequisites": "",
    "learningHours": 150
  }')

echo "POST response: $POST_RESPONSE"
