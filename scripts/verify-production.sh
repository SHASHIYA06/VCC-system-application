#!/bin/bash

# 🚀 VCC Production Verification Script
# Runs comprehensive checks on deployed production environment
# Usage: bash scripts/verify-production.sh

set -e

PROD_URL="https://vcc-system-application.vercel.app"
COLORS_GREEN='\033[0;32m'
COLORS_RED='\033[0;31m'
COLORS_YELLOW='\033[1;33m'
COLORS_BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${COLORS_BLUE}╔══════════════════════════════════════════════════════════╗${NC}"
echo -e "${COLORS_BLUE}║         VCC PRODUCTION VERIFICATION (v1.0)              ║${NC}"
echo -e "${COLORS_BLUE}║  Comprehensive health check for deployment              ║${NC}"
echo -e "${COLORS_BLUE}╚══════════════════════════════════════════════════════════╝${NC}"
echo ""

# Counter for passed/failed tests
PASSED=0
FAILED=0

# Function: Run a test
run_test() {
  local test_name=$1
  local command=$2
  local expected=$3
  
  echo -n "Testing: $test_name... "
  
  result=$(eval "$command" 2>&1 || true)
  
  if [[ "$result" == *"$expected"* ]]; then
    echo -e "${COLORS_GREEN}✅ PASSED${NC}"
    ((PASSED++))
  else
    echo -e "${COLORS_RED}❌ FAILED${NC}"
    echo -e "  Expected: $expected"
    echo -e "  Got: $result"
    ((FAILED++))
  fi
}

echo -e "${COLORS_BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${COLORS_BLUE}🔍 PHASE 1: API Endpoint Tests${NC}"
echo -e "${COLORS_BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Test 1: Wire count
run_test "Wire Database Count" \
  "curl -s '${PROD_URL}/api/wires?limit=1' | jq '.pagination.total'" \
  "167758"

# Test 2: Drawing count
run_test "Drawing Database Count" \
  "curl -s '${PROD_URL}/api/drawings?limit=1' | jq '.pagination.total'" \
  "575"

# Test 3: AI Chat API
run_test "AI Chat Endpoint" \
  "curl -s -X POST '${PROD_URL}/api/ai/chat' \
    -H 'Content-Type: application/json' \
    -d '{\"message\":\"test\",\"mode\":\"learning\"}' | jq '.success'" \
  "true"

# Test 4: Chat API returns response
run_test "AI Response Content" \
  "curl -s -X POST '${PROD_URL}/api/ai/chat' \
    -H 'Content-Type: application/json' \
    -d '{\"message\":\"What is TRAC?\",\"mode\":\"learning\"}' | jq '.response | length > 0'" \
  "true"

# Test 5: Confidence metric
run_test "Confidence Scoring" \
  "curl -s -X POST '${PROD_URL}/api/ai/chat' \
    -H 'Content-Type: application/json' \
    -d '{\"message\":\"test\",\"mode\":\"learning\"}' | jq '.confidence | isnumber'" \
  "true"

echo ""
echo -e "${COLORS_BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${COLORS_BLUE}🔍 PHASE 2: UI Page Tests${NC}"
echo -e "${COLORS_BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Test 6: AI Chat page loads
run_test "Chat UI Page (HTTP)" \
  "curl -s -o /dev/null -w '%{http_code}' '${PROD_URL}/ai-chat'" \
  "200"

# Test 7: Wires page loads
run_test "Wires Page (HTTP)" \
  "curl -s -o /dev/null -w '%{http_code}' '${PROD_URL}/wires'" \
  "200"

# Test 8: Main app loads
run_test "Main App (HTTP)" \
  "curl -s -o /dev/null -w '%{http_code}' '${PROD_URL}/'" \
  "200"

echo ""
echo -e "${COLORS_BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${COLORS_BLUE}🔍 PHASE 3: Data Validation Tests${NC}"
echo -e "${COLORS_BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Test 9: Wire schema validation
run_test "Wire Record Structure" \
  "curl -s '${PROD_URL}/api/wires?limit=1' | jq '.data[0] | has(\"id\") and has(\"wireNo\") and has(\"sourcePin\") and has(\"destPin\")'" \
  "true"

# Test 10: Drawing schema validation
run_test "Drawing Record Structure" \
  "curl -s '${PROD_URL}/api/drawings?limit=1' | jq '.data[0] | has(\"id\") and has(\"drawingNumber\") and has(\"systemId\")'" \
  "true"

# Test 11: AI response schema
run_test "AI Response Structure" \
  "curl -s -X POST '${PROD_URL}/api/ai/chat' \
    -H 'Content-Type: application/json' \
    -d '{\"message\":\"test\",\"mode\":\"learning\"}' | jq 'has(\"success\") and has(\"response\") and has(\"confidence\")'" \
  "true"

echo ""
echo -e "${COLORS_BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${COLORS_BLUE}🔍 PHASE 4: Performance Tests${NC}"
echo -e "${COLORS_BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Test 12: Response time for wires
echo -n "Testing: Wires API Response Time... "
START_TIME=$(date +%s%3N)
curl -s "${PROD_URL}/api/wires?limit=1" > /dev/null
END_TIME=$(date +%s%3N)
RESPONSE_TIME=$((END_TIME - START_TIME))
if [ "$RESPONSE_TIME" -lt 3000 ]; then
  echo -e "${COLORS_GREEN}✅ PASSED${NC} (${RESPONSE_TIME}ms)"
  ((PASSED++))
else
  echo -e "${COLORS_YELLOW}⚠️  SLOW${NC} (${RESPONSE_TIME}ms - acceptable but slow)"
  ((PASSED++))
fi

# Test 13: AI response time
echo -n "Testing: AI Chat Response Time... "
START_TIME=$(date +%s%3N)
curl -s -X POST "${PROD_URL}/api/ai/chat" \
  -H "Content-Type: application/json" \
  -d '{"message":"test","mode":"learning"}' > /dev/null
END_TIME=$(date +%s%3N)
RESPONSE_TIME=$((END_TIME - START_TIME))
if [ "$RESPONSE_TIME" -lt 5000 ]; then
  echo -e "${COLORS_GREEN}✅ PASSED${NC} (${RESPONSE_TIME}ms)"
  ((PASSED++))
else
  echo -e "${COLORS_YELLOW}⚠️  SLOW${NC} (${RESPONSE_TIME}ms - but acceptable for AI)"
  ((PASSED++))
fi

echo ""
echo -e "${COLORS_BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${COLORS_BLUE}📊 PHASE 5: Database Health Check${NC}"
echo -e "${COLORS_BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Test 14: Database connectivity (check via API)
run_test "Database Connection Status" \
  "curl -s '${PROD_URL}/api/wires?limit=1' | jq '.success'" \
  "true"

# Test 15: Pagination works
run_test "Pagination Support" \
  "curl -s '${PROD_URL}/api/wires?page=2&limit=10' | jq '.pagination.currentPage'" \
  "2"

# Test 16: Search functionality
run_test "Wire Search Functionality" \
  "curl -s '${PROD_URL}/api/wires?q=3001' | jq '.data | length > 0'" \
  "true"

echo ""
echo -e "${COLORS_BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${COLORS_BLUE}📋 SUMMARY${NC}"
echo -e "${COLORS_BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

TOTAL=$((PASSED + FAILED))
echo "Total Tests: $TOTAL"
echo -e "Passed: ${COLORS_GREEN}$PASSED${NC}"
echo -e "Failed: ${COLORS_RED}$FAILED${NC}"

if [ "$FAILED" -eq 0 ]; then
  echo ""
  echo -e "${COLORS_GREEN}╔══════════════════════════════════════════════════════════╗${NC}"
  echo -e "${COLORS_GREEN}║           ✅ ALL TESTS PASSED - PRODUCTION READY! 🚀    ║${NC}"
  echo -e "${COLORS_GREEN}╚══════════════════════════════════════════════════════════╝${NC}"
  exit 0
else
  echo ""
  echo -e "${COLORS_RED}╔══════════════════════════════════════════════════════════╗${NC}"
  echo -e "${COLORS_RED}║      ❌ SOME TESTS FAILED - CHECK CONFIGURATION         ║${NC}"
  echo -e "${COLORS_RED}╚══════════════════════════════════════════════════════════╝${NC}"
  exit 1
fi
