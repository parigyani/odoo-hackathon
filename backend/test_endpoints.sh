#!/bin/bash

# GET /api/vehicles/:id test
echo "Testing GET /api/vehicles/:id..."
curl -s -X GET http://localhost:4000/api/vehicles/1 \
  -H "Authorization: Bearer test-token" | grep -q "maintenance_logs"
if [ $? -eq 0 ]; then
  echo "GET /api/vehicles/:id OK"
else
  echo "GET /api/vehicles/:id FAILED"
fi

# GET /api/drivers/:id/trips test
echo "Testing GET /api/drivers/:id/trips..."
curl -s -X GET http://localhost:4000/api/drivers/1/trips \
  -H "Authorization: Bearer test-token" | grep -q "[]"
if [ $? -eq 0 ]; then
  echo "GET /api/drivers/:id/trips OK"
else
  echo "GET /api/drivers/:id/trips FAILED (or empty array check failed)"
fi

# PATCH /api/vehicles/:id (retire when on_trip)
echo "Testing PATCH /api/vehicles/:id (retire when on_trip)..."
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X PATCH http://localhost:4000/api/vehicles/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer test-token" \
  -d '{"status": "retired"}')

if [ "$HTTP_STATUS" -eq 409 ]; then
  echo "PATCH /api/vehicles/:id (on_trip 409) OK"
else
  echo "PATCH /api/vehicles/:id FAILED (Expected 409, got $HTTP_STATUS)"
fi
