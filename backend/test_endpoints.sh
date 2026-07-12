#!/bin/bash

echo "Logging in to get a valid token..."
TOKEN=$(curl -s -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"manager@transitops.com","password":"Test1234","role":"fleet_manager"}' | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "Login failed. Ensure the server is running and the manager account exists."
  exit 1
fi

echo "Got token: ${TOKEN:0:20}..."

# We need actual IDs for the endpoints since they are UUIDs, not '1'.
# Let's get an available vehicle, an on_trip vehicle, and a driver.
AVAILABLE_VEHICLE_ID=$(curl -s -X GET http://localhost:4000/api/vehicles?status=available \
  -H "Authorization: Bearer $TOKEN" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

ON_TRIP_VEHICLE_ID=$(curl -s -X GET http://localhost:4000/api/vehicles?status=on_trip \
  -H "Authorization: Bearer $TOKEN" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

DRIVER_ID=$(curl -s -X GET http://localhost:4000/api/drivers \
  -H "Authorization: Bearer $TOKEN" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

# GET /api/vehicles/:id test
echo "Testing GET /api/vehicles/:id..."
if [ -z "$AVAILABLE_VEHICLE_ID" ]; then
  echo "GET /api/vehicles/:id SKIP (No available vehicle found)"
else
  curl -s -X GET http://localhost:4000/api/vehicles/$AVAILABLE_VEHICLE_ID \
    -H "Authorization: Bearer $TOKEN" | grep -q "maintenance_logs"
  if [ $? -eq 0 ]; then
    echo "GET /api/vehicles/:id OK"
  else
    echo "GET /api/vehicles/:id FAILED"
  fi
fi

# GET /api/drivers/:id/trips test
echo "Testing GET /api/drivers/:id/trips..."
if [ -z "$DRIVER_ID" ]; then
  echo "GET /api/drivers/:id/trips SKIP (No driver found)"
else
  DISPATCHER_TOKEN=$(curl -s -X POST http://localhost:4000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"dispatcher@transitops.com","password":"Test1234","role":"dispatcher"}' | grep -o '"token":"[^"]*' | cut -d'"' -f4)
  
  # The driver might have trips, so just check it returns a valid JSON array or object
  curl -s -X GET http://localhost:4000/api/drivers/$DRIVER_ID/trips \
    -H "Authorization: Bearer $DISPATCHER_TOKEN" | grep -q "\["
  if [ $? -eq 0 ]; then
    echo "GET /api/drivers/:id/trips OK"
  else
    echo "GET /api/drivers/:id/trips FAILED (or empty array check failed)"
  fi
fi

# PATCH /api/vehicles/:id (retire when on_trip)
echo "Testing PATCH /api/vehicles/:id (retire when on_trip)..."
if [ -z "$ON_TRIP_VEHICLE_ID" ]; then
  echo "PATCH /api/vehicles/:id SKIP (No on_trip vehicle found)"
else
  HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X PATCH http://localhost:4000/api/vehicles/$ON_TRIP_VEHICLE_ID \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{"status": "retired"}')

  if [ "$HTTP_STATUS" -eq 409 ]; then
    echo "PATCH /api/vehicles/:id (on_trip 409) OK"
  else
    echo "PATCH /api/vehicles/:id FAILED (Expected 409, got $HTTP_STATUS)"
  fi
fi
